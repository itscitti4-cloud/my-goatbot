const fs = require("fs-extra");
const login = require("fca-unofficial");
const express = require("express");
const app = express();

// Render Keep-Alive
app.get('/', (req, res) => res.send('Goatbot is Running!'));
app.listen(process.env.PORT || 3000, () => console.log("Server is ready"));

// account.txt চেক করা
if (!fs.existsSync('account.txt')) {
    console.error("Error: account.txt ফাইলটি পাওয়া যায়নি!");
    process.exit(1);
}

const appState = JSON.parse(fs.readFileSync('account.txt', 'utf8'));

login({appState: appState}, (err, api) => {
    if(err) return console.error("Login Error: ", err);

    console.log("বট সফলভাবে লগইন হয়েছে!");

    api.listenMqtt((err, event) => {
        if(err) return;
        if (event.type === "message") {
            const msg = event.body ? event.body.toLowerCase() : "";

            if (msg === "hi") {
                api.sendMessage("Hello! আমি আপনার নিজের তৈরি Goatbot V2.", event.threadID);
            }
        }
    });
});

