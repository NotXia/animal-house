import { api_request, getUsername } from "../auth.js";
import $ from "jquery";

const OrderAPI = {
    create: async function (order_data) {
        return await api_request({
            method: "POST",
            url: `${process.env.REACT_APP_DOMAIN}/shop/orders/`,
            data: order_data
        });
    },

    getById: async function (order_id) {
        return await api_request({
            method: "GET",
            url: `${process.env.REACT_APP_DOMAIN}/shop/orders/${encodeURIComponent(order_id)}`,
        });
    },

    getMyOrders: async function (page_size, page_number) {
        return await api_request({
            method: "GET",
            url: `${process.env.REACT_APP_DOMAIN}/shop/orders`,
            data: {
                page_size: page_size,
                page_number: page_number,
                customer: await getUsername()
            }
        });
    },

    deleteOrder: async function (order_id) {
        return await api_request({
            method: "DELETE",
            url: `${process.env.REACT_APP_DOMAIN}/shop/orders/${encodeURIComponent(order_id)}`
        });
    }
}

export default OrderAPI;