// Import modules
const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const fs = require("fs");

const { openModal } = require("./utilities/slack.js");
const { listBrews } = require("./utilities/airtable.js");
const { appHomeView } = require("./blocks/appHome.json");

// Load env variables
dotenv.config();
const appId = process.env.APP_ID;

var app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

// Define a port
const port = process.env.PORT || 8080;

// Start express server
app.listen(port, function () {
    console.log(`\nApp ${appId} listening on port: ${port} ...`);
});

// This route handles GET requests for the root
app.get("/", function (req, res) {
    res.send("👋");
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
    console.log(action);

    // Get Brew list before opening modal
    if (action.actions[0].value == "get-started-home-button") {

        async function listBrewsOpenModal() {
            const brews = await listBrews(maxRecords = 6);

            // Load template modal view
            let listBrewsBlocks = JSON.parse(fs.readFileSync("./blocks/listBrews.json"));

            // Populate modal template with data from airtable
            listBrewsBlocks.blocks[0].text.text = `*${brews.records[0].fields["Brew Code"]}*`;
            listBrewsBlocks.blocks[1].elements[0].text = brews.records[0].fields["Brew Date"];

            listBrewsBlocks.blocks[2].text.text = `*${brews.records[1].fields["Brew Code"]}*`;
            listBrewsBlocks.blocks[3].elements[0].text = brews.records[1].fields["Brew Date"];

            listBrewsBlocks.blocks[4].text.text = `*${brews.records[2].fields["Brew Code"]}*`;
            listBrewsBlocks.blocks[5].elements[0].text = brews.records[2].fields["Brew Date"];

            listBrewsBlocks.blocks[6].text.text = `*${brews.records[3].fields["Brew Code"]}*`;
            listBrewsBlocks.blocks[7].elements[0].text = brews.records[3].fields["Brew Date"];

            listBrewsBlocks.blocks[8].text.text = `*${brews.records[4].fields["Brew Code"]}*`;
            listBrewsBlocks.blocks[9].elements[0].text = brews.records[4].fields["Brew Date"];

            listBrewsBlocks.blocks[10].text.text = `*${brews.records[5].fields["Brew Code"]}*`;
            listBrewsBlocks.blocks[11].elements[0].text = brews.records[5].fields["Brew Date"];

            // Open modal in Slack
            const modal = openModal(trigger_id = action.trigger_id, view = listBrewsBlocks);
        };

        listBrewsOpenModal();
    }
});
