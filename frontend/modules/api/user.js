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
}

export default UserAPI;