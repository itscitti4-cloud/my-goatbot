const express = require('express');
const bodyParser = require('body-parser');
const app = express().use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot is running successfully!');
});

// Facebook Webhook Verification
app.get('/webhook', (req, res) => {
  let VERIFY_TOKEN = "my_secret_token_123"; 
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);      
    }
  }
});

app.listen(PORT, () => console.log(`Server is live on port ${PORT}`));


