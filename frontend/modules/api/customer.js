import { api_request, getUsername } from "../auth.js";
import $ from "jquery";
import { DOMAIN } from "../const";
import UserAPI from "./user";
import moment from "moment";

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
    },

    getVIPPrice: async function () {
        return (await $.ajax({ 
            method: "GET", 
            url: `${DOMAIN}/users/customers/vip/price` 
        })).price;
    },

    isVIP: async function() {
        const user = await UserAPI.getAllData(await getUsername());
        return moment(user.vip_until).isAfter(moment());
    }
}

export default CustomerAPI;