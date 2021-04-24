const axios = require('axios');
const dotenv = require('dotenv');

// Load env variables
dotenv.config();
const botToken = process.env.BOT_TOKEN;

function updateAppHome(user_id, view) {

    return new Promise(resolve => {

        // console.log("\nUpdating App Home");
        // console.log(JSON.stringify(view, null, 2));

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
            if (response.data.ok) {
                // console.log(`App Home Updated for ${user_id}`);
                resolve(response.data);
            } else {
                console.log(`${response.data.error}: ${response.data.response_metadata.messages[0]}`);
            }
        })
        .catch(error => {
            console.log(error.response);
            resolve(error.response);
        });
    });
}

module.exports = { updateAppHome };
