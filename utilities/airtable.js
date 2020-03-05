const axios = require('axios');
const dotenv = require('dotenv');

// Load env variables
dotenv.config();
const airtableToken = process.env.AIRTABLE_TOKEN;
const airtableBase = process.env.AIRTABLE_BASE;

function listBrews(maxRecords) {

    console.log("\nListing Brews");

    return new Promise(resolve => {
        let config = {
            headers: { 'Authorization': `Bearer ${airtableToken}` },
            params: {
                "maxRecords": maxRecords,
                "view": "Ongoing"
            }
        };

        axios.get(`https://api.airtable.com/v0/${airtableBase}/Brew`, config)
            .then(function (response) {
                // handle success
                resolve(response.data);
            })
            .catch(function (error) {
                // handle error
                console.log(error.response.status, error.response.statusText);
            });
    });
}

function listTaps() {

    console.log("\nListing Taps");

    return new Promise(resolve => {
        let config = {
            headers: { 'Authorization': `Bearer ${airtableToken}` },
            params: {
                "maxRecords": 10,
                "view": "On Tap"
            }
        };

        axios.get(`https://api.airtable.com/v0/${airtableBase}/Taps`, config)
            .then(function (response) {
                // handle success
                resolve(response.data);
            })
            .catch(function (error) {
                // handle error
                console.log(error.response.status, error.response.statusText);
            });
    });
}

module.exports = { listBrews, listTaps };
