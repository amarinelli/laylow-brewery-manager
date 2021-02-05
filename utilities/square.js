const axios = require('axios');
const dotenv = require('dotenv');

// Load env variables
dotenv.config();
const squareToken = process.env.SQUARE_TOKEN;

function listInventory(type) {

    // console.log("\nListing Inventory");

    return new Promise(resolve => {

        axios.post("https://connect.squareup.com/v2/inventory/batch-retrieve-counts", {
            "catalog_object_ids": Object.keys(JSON.parse(type))
        }, {
            headers: {
                "Authorization": `Bearer ${squareToken}`,
                "Square-Version": "2021-01-21",
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

module.exports = { listInventory };
