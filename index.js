const { spawn } = require("child_process");
const express = require('express');
const app = express();
const port = process.env.PORT || 10000;

function startProject() {
    console.log("🚀 বটের ইঞ্জিন চালু হচ্ছে...");
    const child = spawn("node", ["Goat.js"], {
        cwd: __dirname,
        stdio: "inherit",
        shell: true
    });

    child.on("close", (code) => {
        if (code !== 0) {
            console.log(`⚠️ বট ক্র্যাশ করেছে (Code: ${code})। ৫ সেকেন্ড পর রিস্টার্ট হচ্ছে...`);
            setTimeout(startProject, 5000);
        }
    });
}

app.get('/', (req, res) => res.send('🤖 Citti Smart Bot is Online!'));
app.listen(port, () => {
    console.log(`🌐 সার্ভার পোর্ট ${port}-এ সচল।`);
    startProject();
});

