import $ from "jquery";
import { DOMAIN } from "../const";
import { api_request } from "../auth.js";

const UserAPI = {
    getProfile: async function (username) {
        return await $.ajax({ 
            method: "GET", 
            url: `${DOMAIN}/users/profiles/${encodeURIComponent(username)}`   
        });
    },

    getAllData: async function (username) {
        return await api_request({ 
            method: "GET", 
            url: `${DOMAIN}/users/customers/${encodeURIComponent(username)}`   
        });
    },

    update: async function (username, updated_data) {
        return await api_request({ 
            method: "PUT", 
            url: `${DOMAIN}/users/customers/${encodeURIComponent(username)}`,
            data: updated_data
        });
    },
}

export default UserAPI;