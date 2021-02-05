const axios = require('axios');
const dotenv = require('dotenv');

// Load env variables
dotenv.config();
const botToken = process.env.BOT_TOKEN;

function openModal(trigger_id, view) {

    console.log("\nOpening Modal");

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
            console.log("\nModal Open");
            return response.data;
        })
        .catch(error => {
            console.log(error.response);
            return error.response;
        });
}

function updateAppHome(user_id, view) {

    return new Promise(resolve => {

        console.log("\nUpdating App Home");

        axios.post("https://slack.com/api/views.publish", {
            user_id, user_id,
            view: view
        }, {
            headers: {
                "Authorization": `Bearer ${botToken}`,
                "Content-Type": "application/json; charset=utf-8"
            }
        })
            .then(response => {
                console.log(`App Home Updated for ${user_id}`);
                resolve(response.data);
            })
            .catch(error => {
                console.log(error.response);
                resolve(error.response);
            });
    });
}

module.exports = { openModal, updateAppHome };
