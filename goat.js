const fs = require("fs-extra");
const login = require("fca-unofficial");
const axios = require("axios");

const prefix = "/"; 

// account.txt চেক করা
if (!fs.existsSync('account.txt')) {
    console.log("❌ account.txt ফাইলটি পাওয়া যায়নি!");
    process.exit(0);
}

const appState = JSON.parse(fs.readFileSync('account.txt', 'utf8'));

login({appState: appState}, (err, api) => {
    if(err) return console.error("❌ লগইন এরর: ", err);

    api.setOptions({ listenEvents: true, selfListen: false, online: true });
    console.log("✅ বট সফলভাবে লগইন হয়েছে!");

    api.listenMqtt(async (err, event) => {
        if(err) return;
        if (event.type !== "message") return;

        const { threadID, messageID, body, senderID } = event;
        if (!body) return;

        const args = body.trim().split(/ +/);
        const command = args.shift().toLowerCase();

        // ১. অটো-রিপ্লাই (স্মার্ট এআই ছাড়াই)
        if (body.toLowerCase() === "hi") {
            return api.sendMessage("হ্যালো! আমি আপনার স্মার্ট অ্যাসিস্ট্যান্ট। কমান্ড দেখতে /help লিখুন।", threadID);
        }

        // ২. প্রিফিক্স চেক
        if (!body.startsWith(prefix)) return;
        const cmd = command.slice(prefix.length);

        // --- কমান্ড সেকশন ---

        // সাহায্য (/help)
        if (cmd === "help") {
            const help = `🌟 স্মার্ট কমান্ড লিস্ট 🌟\n\n` +
                         `🤖 /ai [প্রশ্ন] - জেমিনি এআই দিয়ে উত্তর\n` +
                         `🎨 /img [কি আঁকব] - ছবি জেনারেটর\n` +
                         `🎵 /song [নাম] - গান ডাউনলোড\n` +
                         `🆔 /uid - আপনার আইডি দেখা\n` +
                         `⏰ /time - বর্তমান সময় ও তারিখ`;
            return api.sendMessage(help, threadID);
        }

        // এআই কমান্ড (/ai)
        if (cmd === "ai") {
            const prompt = args.join(" ");
            if (!prompt) return api.sendMessage("বলুন, আমি আপনাকে কীভাবে সাহায্য করতে পারি?", threadID);
            api.sendMessage("🔍 চিন্তা করছি...", threadID);
            try {
                const res = await axios.get(`https://sandipapi.onrender.com/gemini?prompt=${encodeURIComponent(prompt)}`);
                api.sendMessage(res.data.answer, threadID);
            } catch (e) { api.sendMessage("❌ এআই এখন ব্যস্ত আছে।", threadID); }
        }

        // ইমেজ কমান্ড (/img)
        if (cmd === "img") {
            const prompt = args.join(" ");
            if (!prompt) return api.sendMessage("কি আঁকব বলুন? যেমন: /img a futuristic city", threadID);
            api.sendMessage("🎨 ছবি আঁকছি, একটু অপেক্ষা করুন...", threadID);
            try {
                const imgUrl = `https://sandipapi.onrender.com/imagine?prompt=${encodeURIComponent(prompt)}&model=prodia`;
                api.sendMessage({ attachment: await axios.get(imgUrl, { responseType: 'stream' }).then(res => res.data) }, threadID);
            } catch (e) { api.sendMessage("❌ ছবি আঁকতে পারলাম না।", threadID); }
        }

        // তারিখ ও সময় (/time)
        if (cmd === "time") {
            const d = new Date();
            const time = d.toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' });
            api.sendMessage(`🕒 বর্তমান সময় ও তারিখ:\n${time}`, threadID);
        }

    });
});

