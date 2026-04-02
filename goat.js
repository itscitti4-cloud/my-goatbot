const fs = require("fs-extra");
const login = require("fca-unofficial");
const path = require("path");

const config = {
    prefix: "/",
    adminID: "61586632438983" // আপনার আইডি দিন
};

const commands = new Map();
const events = new Map();

// কমান্ড লোড করার ফাংশন
const cmdFiles = fs.readdirSync(path.join(__dirname, 'scripts/cmds')).filter(file => file.endsWith('.js'));
for (const file of cmdFiles) {
    const command = require(`./scripts/cmds/${file}`);
    commands.set(command.config.name, command);
}

// ইভেন্ট লোড করার ফাংশন
const eventFiles = fs.readdirSync(path.join(__dirname, 'scripts/events')).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./scripts/events/${file}`);
    events.set(event.config.name, event);
}

console.log(`✅ ${commands.size}টি কমান্ড এবং ${events.size}টি ইভেন্ট লোড হয়েছে!`);

const appState = JSON.parse(fs.readFileSync('account.txt', 'utf8'));

login({appState: appState}, (err, api) => {
    if(err) return console.error("Login failed!");

    api.setOptions({ listenEvents: true, selfListen: false, online: true });

    api.listenMqtt(async (err, event) => {
        if(err) return;

        // ইভেন্ট হ্যান্ডলার (Welcome/Leave ইত্যাদি)
        for (const [name, ev] of events) {
            ev.run({ api, event, config });
        }

        if (event.type !== "message" || !event.body) return;

        const args = event.body.trim().split(/ +/);
        if (!event.body.startsWith(config.prefix)) return;
        
        const commandName = args.shift().toLowerCase().slice(config.prefix.length);
        const command = commands.get(commandName);

        if (command) {
            try {
                command.run({ api, event, args, config });
            } catch (e) {
                api.sendMessage(`❌ কমান্ড রান করতে সমস্যা হয়েছে: ${e.message}`, event.threadID);
            }
        }
    });
});
