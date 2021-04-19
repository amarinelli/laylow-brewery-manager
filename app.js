//Import debugger
require('@google-cloud/debug-agent').start({ serviceContext: { enableCanary: false } });

// Import modules
const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const fs = require("fs");

const { updateAppHome } = require("./utilities/slack.js");
const { listBrews } = require("./utilities/airtable.js");
const { listInventory } = require("./utilities/square.js");

// Load env variables
dotenv.config();
const bottleVariations = process.env.BOTTLES;
const merchVariations = process.env.MERCH;
const airtableBase = process.env.AIRTABLE_BASE;

var app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

// Define a port
const port = process.env.PORT || 8080;

// Start express server
app.listen(port, function () {
    // console.log(`\nLaylow Brewery Manager is running ...`);
});

// This route handles GET requests for the root
app.get("/", function (req, res) {
    res.send("🍺");
});

// This route handles POST requests for Slack events
app.post("/events", function (req, res) {

    if (req.body.challenge) {
        // Respond to the challenge
        res.send({
            "challenge": req.body.challenge
        });
        // console.log("Challenge sent");
    } else {

        // Respond to Events API with 200 OK
        res.sendStatus(200);

        // console.log("\nNew event");

        // Print the Event API Request body
        // console.log(JSON.stringify(req.body, null, 4));

        let event = req.body.event;

        if (event.type == "app_home_opened") {
            // console.log("App Home Opened");
        }

    }
});

// This route handles POST requests for Slack interactions
app.post("/action", function (req, res) {

    // console.log("\nNew interaction");

    // Respond to Slack with 200 OK
    res.sendStatus(200);

    // Parse the payload
    let action = JSON.parse(req.body.payload);

    // Log the request payload

    // The "Refresh" button was clicked on the App Home View
    if (action.actions[0].action_id == "refresh-bottle-inventory-button") {

        // Load template app home view
        let AppHomeView = JSON.parse(fs.readFileSync("./blocks/appHome.json"));
        
        let current_datetime = new Date()
        let options = { timeZone: 'America/Toronto', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
        let formatted_date = current_datetime.toLocaleString('en-CA', options);

        AppHomeView.blocks[2].text.text = `_Last updated from <https://squareup.com/dashboard/|Square> & <https://airtable.com/${airtableBase}|Airtable> on *${formatted_date}*_`
        
        async function gatherData() {

            //
            // BOTTLE SHOP
            //

            const bottleInventoryList = await listInventory(bottleVariations);

            bottles = JSON.parse(bottleVariations);

            bottleInventoryList.counts.forEach(item => {
                AppHomeView.blocks[5].fields.push({
                    "type": "mrkdwn",
                    "text": `*${bottles[item.catalog_object_id]}*: ${item.quantity}`
                })
            });

            //
            // MERCH
            //

            const merchInventoryList = await listInventory(merchVariations);

            merch = JSON.parse(merchVariations);

            merchInventoryList.counts.forEach(item => {
                if (item.state == "IN_STOCK") {
                    AppHomeView.blocks[8].fields.push({
                        "type": "mrkdwn",
                        "text": `*${merch[item.catalog_object_id]}*: ${item.quantity}`
                    })
                }
            });

            //
            // RECENT BREWS
            //

            const brews = await listBrews(maxRecords = 6);

            brews.records.forEach(brew => {
                AppHomeView.blocks[11].fields.push({
                    "type": "mrkdwn",
                    "text": `*<${brew.fields["Brewing Record"]}|${brew.fields["Brew Code"]}>* _(brewed on ${new Date(brew.fields["Brew Date"]).toLocaleString('en-CA', { timeZone: 'America/Toronto', year: 'numeric', month: 'long', day: 'numeric' })})_`
                })
            });

            //
            // PUBLISH
            //

            updateAppHome(action.user.id, AppHomeView);
        };

        gatherData();

    } else {
        return
    }
});

// This route handles POST requests for Slack slash commands
app.post("/debug", function (req, res) {

    // console.log("\nRun debug slash command");

    // Parse the payload
    // console.log(req.body);

    let current_datetime = new Date()
    let options = { timeZone: 'America/Toronto', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    let formatted_date = current_datetime.toLocaleString('en-CA', options);

    AppHomeView = {
        "type": "home",
        "callback_id": "brewery-manager-app-home=debug",
        "blocks": [
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "action_id": "refresh-bottle-inventory-button",
                        "text": {
                            "type": "plain_text",
                            "text": ":zap: Refresh"
                        }
                    }
                ]
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `_Last updated on *${formatted_date}*_`
                }
            }
        ]
    }

    const userIds = process.env.IDS;
    let users = userIds.split(",");

    users.forEach((user) => {
        updateAppHome(user, AppHomeView);
    });

    res.send({
        "response_type": "ephemeral",
        "text": "Completed! _check app home_"
    })
});

// This route handles GET requests for all other routes
app.get("*", function (req, res) {
    res.send("🍺");
});
