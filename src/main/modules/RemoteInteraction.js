/*global process*/
/*eslint no-undef: "error"*/

require("dotenv").config();

const axios = require("axios");

class RemoteInteraction {
    getRobloxAccount = async (discordId) => {
        let endpointResponse = await axios.get(`https://verify.eryn.io/api/user/${discordId.toString()}`).catch(() => {});

        if (endpointResponse) {
            endpointResponse = endpointResponse.data;
            return { success: endpointResponse.status === "ok", response: endpointResponse };
        } else {
            return { success: false };
        }
    };

    banInGame = async (payload) => {
        let endpointResponse;
        try {
            endpointResponse = await axios.post(`https://ns-api-nnrz4.ondigitalocean.app/api/remote/outbound/bans`, payload, {
                headers: {
                    Authorization: process.env.nsAPIAuth,
                },
            });
        } catch (err) {
            return { success: false, raw: JSON.stringify(err.response.data) };
        }

        endpointResponse = endpointResponse.data;
        return { success: endpointResponse ? endpointResponse.status === "ok" : false, raw: JSON.stringify(endpointResponse.data) };
    };

    unbanInGame = async (payload) => {
        let endpointResponse;
        try {
            endpointResponse = await axios.post(`https://ns-api-nnrz4.ondigitalocean.app/api/remote/outbound/unbans`, payload, {
                headers: {
                    Authorization: process.env.nsAPIAuth,
                },
            });
        } catch (err) {
            return { success: false, raw: JSON.stringify(err.response.data) };
        }

        endpointResponse = endpointResponse.data;
        return { success: endpointResponse ? endpointResponse.status === "ok" : false, raw: JSON.stringify(endpointResponse.data) };
    };

    kickInGame = async (payload) => {
        let endpointResponse;
        try {
            endpointResponse = await axios.post(`https://ns-api-nnrz4.ondigitalocean.app/api/remote/outbound/kicks`, payload, {
                headers: {
                    Authorization: process.env.nsAPIAuth,
                },
            });
        } catch (err) {
            return { success: false, raw: JSON.stringify(err.response.data) };
        }

        endpointResponse = endpointResponse.data;
        return { success: endpointResponse ? endpointResponse.status === "ok" : false, raw: JSON.stringify(endpointResponse.data) };
    };

    sdInGame = async (payload) => {
        let endpointResponse;
        try {
            endpointResponse = await axios.post(`https://ns-api-nnrz4.ondigitalocean.app/api/remote/outbound/shutdowns`, payload, {
                headers: {
                    Authorization: process.env.nsAPIAuth,
                },
            });
        } catch (err) {
            return { success: false, raw: JSON.stringify(err.response.data) };
        }

        endpointResponse = endpointResponse.data;
        return { success: endpointResponse ? endpointResponse.status === "ok" : false, raw: JSON.stringify(endpointResponse.data) };
    };
}

module.exports = new RemoteInteraction();
