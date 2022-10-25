import { api_request } from "../auth.js";
import $ from "jquery";

const CartAPI = {
    getByUsername: async function (username) {
        return await api_request({ 
            method: "GET", 
            url: `${process.env.REACT_APP_DOMAIN}/users/customers/${encodeURIComponent(username)}/cart/` 
        });
    },

    emptyByUser: async function (username) {
        return await api_request({ 
            method: "PUT", url: `${process.env.REACT_APP_DOMAIN}/users/customers/${encodeURIComponent(username)}/cart/`,
            processData: false, contentType: "application/json",
            data: JSON.stringify({ cart: [] })
        });
    }
}

export default CartAPI;