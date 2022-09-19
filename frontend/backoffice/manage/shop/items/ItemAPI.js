import { api_request } from "/js/auth.js";

export async function create(item_data) {
    return await api_request({ 
        type: "POST", url: `/shop/items/`,
        processData: false, contentType: "application/json",
        data: JSON.stringify(item_data)
    });
}