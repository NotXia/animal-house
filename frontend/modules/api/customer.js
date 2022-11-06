import { api_request } from "../auth.js";
import $ from "jquery";
import { DOMAIN } from "../const";

const CustomerAPI = {
    getAllDataByUsername: async function (username) {
        return await api_request({ 
            method: "GET", 
            url: `${DOMAIN}/users/customers/${encodeURIComponent(username)}/` 
        });
    }
}

export default CustomerAPI;