const axios = require('axios');
const dotenv = require('dotenv');

// Load env variables
dotenv.config();
const squareToken = process.env.SQUARE_TOKEN;

function listBottles() {

    console.log("\nListing Bottles");

    return new Promise(resolve => {

        axios.post("https://connect.squareup.com/v2/catalog/search", {
            object_types: [
                "ITEM"
            ],
            query: {
                text_query: {
                    keywords: [
                        "bottle"
                    ]
                }
            }
        }, {
            headers: {
                "Authorization": `Bearer ${squareToken}`,
                "Square-Version": "2020-06-25",
                "Content-Type": "application/json"
            }
        })
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

module.exports = { listBottles };
