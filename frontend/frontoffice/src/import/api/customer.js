import { api_request } from "../auth.js";
import $ from "jquery";

const CustomerAPI = {
    getAllDataByUsername: async function (username) {
        return await api_request({ 
            method: "GET", 
            url: `${process.env.REACT_APP_DOMAIN}/users/customers/${encodeURIComponent(username)}/` 
        });
    }
}

export default CustomerAPI;