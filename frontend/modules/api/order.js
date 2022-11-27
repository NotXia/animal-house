import { api_request } from "../auth.js";
import $ from "jquery";
import { DOMAIN } from "../const";

const OrderAPI = {
    create: async function (order_data) {
        return await api_request({
            method: "POST",
            url: `${DOMAIN}/shop/orders/`,
            data: order_data
        });
    },

    getById: async function (order_id) {
        return await api_request({
            method: "GET",
            url: `${DOMAIN}/shop/orders/${encodeURIComponent(order_id)}`,
        });
    }
}

export default OrderAPI;