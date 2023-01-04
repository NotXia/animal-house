import { api_request } from "../auth.js";
import $ from "jquery";
import { DOMAIN } from "../const";

const CustomerAPI = {
    getAllDataByUsername: async function (username) {
        return await api_request({ 
            method: "GET", 
            url: `${DOMAIN}/users/customers/${encodeURIComponent(username)}/` 
        });
    },

    startVIPCheckout: async function () {
        return await api_request({ 
            method: "POST", 
            url: `${DOMAIN}/users/customers/vip/checkout` 
        });
    },

    completeVIPCheckout: async function () {
        return await api_request({ 
            method: "POST", 
            url: `${DOMAIN}/users/customers/vip/success` 
        });
    }
}

export default CustomerAPI;