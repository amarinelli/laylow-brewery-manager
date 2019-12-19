// Import modules
const express = require('express');
const bodyParser = require('body-parser');

const axios = require('axios');

require('dotenv').config()

const appId = process.env.APP_ID;
const botToken = process.env.BOT_TOKEN;

var app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

// Define a port
const PORT = 4390;

// Start server
app.listen(PORT, function () {
    console.log(`\nApp ${appId} listening on port: ${PORT} ...`);
});

// This route handles GET requests for the root
app.get('/', function (req, res) {
    res.send("👋");
});

// This route handles POST requests for Slack events
app.post('/events', function (req, res) {

    if (req.body.challenge) {
        // Respond to the challenge
        res.send({
            "challenge": req.body.challenge
        });
        console.log("Challenge sent");
    } else {

        // Respond to Events API with 200 OK
        res.sendStatus(200);

        console.log("\n============ NEW EVENT ============");
        console.log("===================================");

        // Print the Event API Request body
        console.log(JSON.stringify(req.body, null, 4));

        let event = req.body.event;

        if (event.type == "app_home_opened") {
            console.log("App Home Opened");
        }

        console.log("###################################");

    }
});

// This route handles POST requests for Slack events
app.post('/action', function (req, res) {

    // Respond to Slack with 200 OK
    res.sendStatus(200);

    console.log("\n============ NEW ACTION ============");
    console.log("===================================");

    // Print the Event API Request body
    console.log(req.body);

    console.log("###################################");

});
