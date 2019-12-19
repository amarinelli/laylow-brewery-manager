// Import modules
const express = require('express');
const bodyParser = require('body-parser');

const axios = require('axios');

require('dotenv').config()

const appId = process.env.APP_ID;
const botToken = process.env.BOT_TOKEN;
const airtableToken = process.env.AIRTABLE_TOKEN;
const airtableBase = process.env.AIRTABLE_BASE;

let appHomeView = {
    "type": "home",
    "callback_id": "brewery-manager-app-home",
    "blocks": [
        {
            "type": "actions",
            "block_id": "get-started-home-action",
            "elements": [
                {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "Get Started",
                        "emoji": true
                    },
                    "value": "get-started-home-button"
                }
            ]
        },
        {
            "type": "image",
            "image_url": "https://laylow.beer/img/laylow-brewery.jpg",
            "alt_text": "Laylow Brewery logo"
        },
        {
            "type": "context",
            "elements": [
                {
                    "type": "mrkdwn",
                    "text": "Last updated Dec 19, 2019"
                }
            ]
        }
    ]
}

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

        // Print the Event API Request body
        console.log(JSON.stringify(req.body, null, 4));

        let event = req.body.event;

        if (event.type == "app_home_opened") {
            console.log("App Home Opened");
        }

    }
});

// This route handles POST requests for Slack events
app.post('/action', function (req, res) {

    console.log("\n============ NEW ACTION ============");

    // Respond to Slack with 200 OK
    res.sendStatus(200);

    // Parse the payload
    let action = JSON.parse(req.body.payload);

    // Log the request payload
    console.log(action);

    if (action.actions[0].value == "get-started-home-button") {

        async function listBrewsOpenModal() {
            const brews = await listBrews(maxRecords = 6);
            const modal = openModal(action.trigger_id, {
                "type": "modal",
                "callback_id": "brewery-manager-app-home-modal",
                "notify_on_close": false,
                "title": {
                    "type": "plain_text",
                    "text": "Past 6 brews",
                    "emoji": true
                },
                "close": {
                    "type": "plain_text",
                    "text": "Close",
                    "emoji": true
                },
                "blocks": [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": `*${brews.records[0].fields["Brew Code"]}*`
                        }
                    },
                    {
                        "type": "context",
                        "elements": [
                            {
                                "type": "mrkdwn",
                                "text": brews.records[0].fields["Brew Date"]
                            }
                        ]
                    },
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": `*${brews.records[1].fields["Brew Code"]}*`
                        }
                    },
                    {
                        "type": "context",
                        "elements": [
                            {
                                "type": "mrkdwn",
                                "text": brews.records[1].fields["Brew Date"]
                            }
                        ]
                    },
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": `*${brews.records[2].fields["Brew Code"]}*`
                        }
                    },
                    {
                        "type": "context",
                        "elements": [
                            {
                                "type": "mrkdwn",
                                "text": brews.records[2].fields["Brew Date"]
                            }
                        ]
                    },
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": `*${brews.records[3].fields["Brew Code"]}*`
                        }
                    },
                    {
                        "type": "context",
                        "elements": [
                            {
                                "type": "mrkdwn",
                                "text": brews.records[3].fields["Brew Date"]
                            }
                        ]
                    },
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": `*${brews.records[4].fields["Brew Code"]}*`
                        }
                    },
                    {
                        "type": "context",
                        "elements": [
                            {
                                "type": "mrkdwn",
                                "text": brews.records[4].fields["Brew Date"]
                            }
                        ]
                    },
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": `*${brews.records[5].fields["Brew Code"]}*`
                        }
                    },
                    {
                        "type": "context",
                        "elements": [
                            {
                                "type": "mrkdwn",
                                "text": brews.records[5].fields["Brew Date"]
                            }
                        ]
                    }
                ]
            });
        };

        listBrewsOpenModal();
    }
});

function openModal(trigger_id, view) {

    console.log("\n============ OPEN MODAL ============");

    axios.post("https://slack.com/api/views.open", {
        trigger_id: trigger_id,
        view: view

    }, {
        headers: {
            "Authorization": `Bearer ${botToken}`,
            "Content-Type": "application/json; charset=utf-8"
        }
    })
        .then(response => {
            console.log(response.data)
            return response.data;
        })
        .catch(error => {
            console.log(error.response)
            return error.response
        });
};

function listBrews(maxRecords) {

    console.log("\n============ LIST BREWS ============");

    return new Promise(resolve => {

        let config = {
            headers: { 'Authorization': `Bearer ${airtableToken}` },

            // TODO Only request necessary "fields"
            params: {
                "maxRecords": maxRecords,
                "view": "Ongoing"
            },
        }

        axios.get(`https://api.airtable.com/v0/${airtableBase}/Brew`, config)
            .then(function (response) {
                // handle success
                console.log(response.data);
                resolve(response.data)
            })
            .catch(function (error) {
                // handle error
                console.log(error.response.status, error.response.statusText);
            })

    });
};
