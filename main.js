const { Client } = require('discord.js-selfbot-v13');
const prompt = require("prompt-sync")({ sigint: true });
const fs = require('node:fs');

var cfg = { //Example config
    "token": "",
    "channel_id": "",
    "presets": {
        "owo": {
            "default_cooldown": [15250, 16500],
            "bot": {
                "id": "408785106942164992",
                "dmid": "" //Bot direct message channel id
            },
            "cmds": [
                ["msg", ["owo hunt", "owohunt", "owoh"]],
                ["msg", ["owo battle", "owob", "owobattle"]]
            ]
        },
        "vfish": {
            "default_cooldown": 2300,
            "bot": {
                "id": "574652751745777665",
                "dmid": ""
            },
            "cmds": [
                ["slash", ["fish"]]
            ]
        }
    }
}

function savecfg(){
    fs.open("./config.json", "w", (_, f) => {
        fs.write(f, JSON.stringify(cfg, null, 2), ()=>{});
        fs.close(f, ()=>{});
    });
}

function rnd(min=0, max=1, d=2) {
    return Number((Math.random() * (max - min) + min).toFixed(d))
}

try {
    let td = fs.readFileSync("./config.json", {encoding: "utf8", "flag": "r"});
    if(td){
        cfg = JSON.parse(td);
    } else {
        throw new Error();
    }
}
catch {
        console.log("Config Not Found!");
        cfg.token = prompt("Enter Your Token: ").replace(" ", "");
        cfg.channel_id = prompt("Enter Channel ID: ").replace(" ", "");
        savecfg(cfg);
}

function rndc(a){
    return a[Math.floor(Math.random()*a.length)]
}

const client = new Client();

const pfx = ".";
var isStart = false,
    l, o, mc,
    captchaChecked = false;

function stopL(){
    isStart = false;
    clearInterval(l);
}

client.on('ready', async () => {
    console.log(`${client.user.username} is ready!`);
    mc = client.channels.cache.get(cfg.channel_id);
});

client.on("messageCreate", function(msg) {
    if(msg.author.id == client.user.id){
        c = msg.content.toLowerCase();
        var args = c.split(" ");
        if(c[0] == pfx){
            let scmd = args[0].slice(1);
            switch(scmd){
                case "obt":
                    o = args[1];
                    if (o&&cfg.presets[o]&&isStart==false){
                    isStart = true;
                    msg.channel.send(`**[${o}]** _Started at <#${cfg.channel_id}>!_`);
                    console.log(`[${o}] Started!`);
                    (function handle(){
                        captchaChecked = false;
                        for(let i of cfg.presets[o].cmds){
                            if(typeof i[1] != "object"){
                                i[1] = Array(i[1]);
                            }
                            let cmd = rndc(i[1])
                            mc.sendTyping();
                            switch(i[0]){
                                case "msg":
                                    mc.send(cmd);
                                    console.log("[+] Sent msg '" + cmd + "'!");
                                    break;
                                case "slash":
                                    mc.sendSlash(cfg.presets[o].bot.id, cmd);
                                    console.log("[+] Sent slash '" + cmd + "'!");
                                    break;
                                }
                        }
                        if((typeof cfg.presets[o].default_cooldown) == "number"){
                            setTimeout(handle, cfg.presets[o].default_cooldown);
                        } else {
                            setTimeout(handle, rnd(...cfg.presets[o].default_cooldown, 0));
                        }
                    })();
                    } else {
                        stopL();
                        msg.channel.send(`**[+]** _Stopped!_`);
                        console.log(`[+] Stopped!`);
                    }
                    break;
                case "setchannel":
                    if(args[1]){
                        cfg.channel_id = args[1].trim();
                        savecfg();
                        mc.send("_Changed Channel ID to_ **" + cfg.channel_id + "**");
                        console.log("Changed Channel ID to " + cfg.channel_id);
                        mc = client.channels.cache.get(cfg.channel_id);
                    } else {
                        mc.send("_Please provide Channel ID!_")
                    }
                    break;
            }
        }
    }
    if(isStart){
        if(msg.author.id == cfg.presets[o].bot.id && (msg.channelId == cfg.channel_id || msg.channelId == cfg.presets[o].bot.dmid)){
            if(msg.content.toLowerCase().includes("captcha") && !captchaChecked){
                captchaChecked = true;
                mc.send(`<@${client.user.id}>`).then(e=>{
                    e.markUnread().then(()=>prompt("[!] Please verify captcha to continue... "));
                });
            }
        }
    }
});

client.login(cfg.token);
