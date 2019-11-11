'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
var request = require("request");

// create LINE SDK config from env variables
const config = {
   channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN||'BK65LSyrUWFZt7pdciBVAHy0A0LCdZrOSW0WZdKzVowRnN0ODlbodnCyrSC9P4JcJZOUW2unPAikx5yXRIl+BvZibNgkaNTxh5Ddl6qAZesjk22QMB9tubb7e36dKRdnpsi7/CU06aNFfo4hvlcocAdB04t89/1O/w1cDnyilFU=',
   channelSecret: process.env.CHANNEL_SECRET||'37b87bcca557f10d63e1abc51974a9eb',
};

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
app.post('/webhook', line.middleware(config), (req, res) => {
   Promise
       .all(req.body.events.map(handleEvent))
       .then((result) => res.json(result))
       .catch((err) => {
        console.error(err);
        res.status(500).end();
      });
});

// event handler
function handleEvent(event) {
   if (event.type !== 'message' || event.message.type !== 'text') {
       // ignore non-text-message event
       return Promise.resolve(null);
   }
   var options = {
       method: 'GET',
       url: 'https://api.susi.ai/susi/chat.json',
       qs: {
           timezoneOffset: '-330',
           q: event.message.text
       }
   };
   request(options, function(error, response, body) {
       if (error) throw new Error(error);
       // answer fetched from susi
       var ans = (JSON.parse(body)).answers[0].actions[0].expression;
       // create a echoing text message
       const answer = {
           type: 'text',
           text: ans
       };
       // use reply API
       return client.replyMessage(event.replyToken, answer);
   })
}

// listen on port

const port = process.env.PORT || 3000;
app.listen(port, () => {
   console.log(`listening on ${port}`);
});