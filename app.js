// Import modules
const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const fs = require("fs");

const { openModal } = require("./utilities/slack.js");
const { updateAppHome } = require("./utilities/slack.js");

const { listBrews } = require("./utilities/airtable.js");
const { listTaps } = require("./utilities/airtable.js");

const { listBottles } = require("./utilities/square.js");

// Load env variables
dotenv.config();
const bottleVariations = process.env.BOTTLES;

var app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

// Define a port
const port = process.env.PORT || 8080;

// Start express server
app.listen(port, function () {
    console.log(`\nLaylow Brewery Manager is running ...`);
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
        console.log("Challenge sent");
    } else {

        // Respond to Events API with 200 OK
        res.sendStatus(200);

        console.log("\nNew event");

        // Print the Event API Request body
        console.log(JSON.stringify(req.body, null, 4));

        let event = req.body.event;

        if (event.type == "app_home_opened") {
            console.log("App Home Opened");
        }

    }
});

// This route handles POST requests for Slack interactions
app.post("/action", function (req, res) {

    console.log("\nNew interaction");

    // Respond to Slack with 200 OK
    res.sendStatus(200);

    // Parse the payload
    let action = JSON.parse(req.body.payload);

    // Log the request payload

    // The "Recent brews" button was clicked on the App Home View
    if (action.actions[0].action_id == "recent-brews-home-button") {

        async function listBrewsOpenModal() {
            const brews = await listBrews(maxRecords = 6);

            // Load template modal view
            let listBrewsBlocks = JSON.parse(fs.readFileSync("./blocks/listBrews.json"));

            // Populate modal template with data from airtable

            listBrewsBlocks.title.text = "Recent Brews";

            listBrewsBlocks.blocks[0].text.text = `*${brews.records[0].fields["Brew Code"]}*`;
            listBrewsBlocks.blocks[1].elements[0].text = `Brewed on ${brews.records[0].fields["Brew Date"]}`;

            listBrewsBlocks.blocks[2].text.text = `*${brews.records[1].fields["Brew Code"]}*`;
            listBrewsBlocks.blocks[3].elements[0].text = `Brewed on ${brews.records[1].fields["Brew Date"]}`;

            listBrewsBlocks.blocks[4].text.text = `*${brews.records[2].fields["Brew Code"]}*`;
            listBrewsBlocks.blocks[5].elements[0].text = `Brewed on ${brews.records[2].fields["Brew Date"]}`;

            listBrewsBlocks.blocks[6].text.text = `*${brews.records[3].fields["Brew Code"]}*`;
            listBrewsBlocks.blocks[7].elements[0].text = `Brewed on ${brews.records[3].fields["Brew Date"]}`;

            listBrewsBlocks.blocks[8].text.text = `*${brews.records[4].fields["Brew Code"]}*`;
            listBrewsBlocks.blocks[9].elements[0].text = `Brewed on ${brews.records[4].fields["Brew Date"]}`;

            listBrewsBlocks.blocks[10].text.text = `*${brews.records[5].fields["Brew Code"]}*`;
            listBrewsBlocks.blocks[11].elements[0].text = `Brewed on ${brews.records[5].fields["Brew Date"]}`;

            // Open modal in Slack
            const modal = openModal(trigger_id = action.trigger_id, view = listBrewsBlocks);
        };

        listBrewsOpenModal();
    }

    // The "Tap lineup" button was clicked on the App Home View
    else if ((action.actions[0].action_id == "tap-lineup-home-button")) {

        async function listTapsOpenModal() {
            const taps = await listTaps();

            // Load template modal view
            let listBrewsBlocks = JSON.parse(fs.readFileSync("./blocks/listTaps.json"));

            // Populate modal template with data from airtable

            listBrewsBlocks.title.text = "Tap Lineup";

            taps.records.forEach((tap, num) => {

                listBrewsBlocks.blocks.push(
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": `\`${num + 1}.\` *${tap.fields["Brew Code"]}*`
                        }
                    },
                    {
                        "type": "context",
                        "elements": [
                            {
                                "type": "mrkdwn",
                                "text": `Tapped on ${tap.fields["Tapped Date"]}`
                            }
                        ]
                    }
                )

            });

            // Open modal in Slack
            const modal = openModal(trigger_id = action.trigger_id, view = listBrewsBlocks);
        };

        listTapsOpenModal();

    }

    // The "Refresh" button was clicked on the App Home View
    else if ((action.actions[0].action_id == "refresh-bottle-inventory-button")) {

        // Load template app home view
        let AppHomeView = JSON.parse(fs.readFileSync("./blocks/appHome.json"));

        let current_datetime = new Date()
        let options = { timeZone: 'America/Toronto', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
        let formatted_date = current_datetime.toLocaleString('en-CA', options);

        AppHomeView.blocks[1].text.text = `_Last updated from <https://squareup.com/dashboard/|Square> on *${formatted_date}*_`

        async function listSquareBottleInventory() {
            const bottleInventoryList = await listBottles();

            bottles = JSON.parse(bottleVariations);

            bottleInventoryList.counts.forEach(item => {
                AppHomeView.blocks[2].fields.push({
                    "type": "mrkdwn",
                    "text": `*${bottles[item.catalog_object_id]}*: ${item.quantity}`
                })
            });

            updateAppHome(action.user.id, AppHomeView);
        };

        listSquareBottleInventory();

    }
});

// This route handles POST requests for Slack slash commands
app.post("/debug", function (req, res) {

    console.log("\nNew slash command");

    // Parse the payload
    // console.log(req.body);

    // Load template app home view
    let AppHomeView = JSON.parse(fs.readFileSync("./blocks/appHome.json"));

    let current_datetime = new Date()
    let options = { timeZone: 'America/Toronto', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    let formatted_date = current_datetime.toLocaleString('en-CA', options);

    AppHomeView.blocks[1].text.text = `Last updated from <https://squareup.com/dashboard/|Square> on *${formatted_date}*`

    const userIds = process.env.IDS;
    let users = userIds.split(",");

    users.forEach((user) => {
        updateAppHome(user, AppHomeView);
    })

    res.send({
        "response_type": "ephemeral",
        "text": "Completed"
    })
});

// This route handles GET requests for all other routes
app.get("*", function (req, res) {
    res.send("🍺");
});
