const { Client } = require('discord.js-selfbot-v13');
const prompt = require("prompt-sync")({ sigint: true });
const fs = require('node:fs');

var cfg = { //Example config
    "token": "",
    "channel_id": "",
    "presets": {
        "owo": {
            "default_cooldown": 15500,
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
var isStart = false;
var l;
var o;
var mc;

client.on('ready', async () => {
    console.log(`${client.user.username} is ready!`);
    mc = client.channels.cache.get(cfg.channel_id);
});

client.on("messageCreate", function(msg) {
    if(msg.author.id == client.user.id){
        c = msg.content.toLowerCase();
        var args = c.split(" ");
        if(c.startsWith(pfx + "obt")){
            o = args[1];
            if (o&&cfg.presets[o]&&isStart==false){
                isStart = true;
                msg.channel.send(`**[${o}]** _Started!_ `);
                console.log(`[${o}] Started!`);
                l = setInterval(function handle(){
                    for(let i of cfg.presets[o].cmds){
                        if(typeof i[1] != "object"){
                            i[1] = Array(i[1]);
                        }
                        let cmd = rndc(i[1])
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
                }, cfg.presets[o].default_cooldown)
            } else {
                isStart = false;
                msg.channel.send(`**[+]** _Stopped!_`);
                console.log(`[+] Stopped!`);
                clearInterval(l);
            }
        } else if (c.startsWith(pfx + "setchannel")){
            if(args[1]){
                msg.channel.send(".obt");
                cfg.channel_id = args[1].trim();
                savecfg();
                mc.send("_Changed Channel ID to_ **" + cfg.channel_id + "**");
                console.log("Changed Channel ID to " + cfg.channel_id);
                mc = client.channels.cache.get(cfg.channel_id);
            } else {
                mc.send("_Please provide Channel ID!_")
            }
        }
    }
    if(isStart){
        if(msg.author.id == cfg.presets[o].bot.id && (msg.channelId == cfg.channel_id || msg.channelId == cfg.presets[o].bot.dmid)){
            if(msg.content.toLowerCase().includes("captcha")){
                prompt("[!] Please verify captcha to continue... ");
            }
        }
    }
});

client.login(cfg.token);