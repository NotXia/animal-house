import { api_request } from "../auth.js";
import $ from "jquery";
import { DOMAIN } from "../const";

const CartAPI = {
    getByUsername: async function (username) {
        return await api_request({ 
            method: "GET", 
            url: `${DOMAIN}/users/customers/${encodeURIComponent(username)}/cart/` 
        });
    },

    emptyByUser: async function (username) {
        return await api_request({ 
            method: "PUT", url: `${DOMAIN}/users/customers/${encodeURIComponent(username)}/cart/`,
            processData: false, contentType: "application/json",
            data: JSON.stringify({ cart: [] })
        });
    }
}

export default CartAPI;