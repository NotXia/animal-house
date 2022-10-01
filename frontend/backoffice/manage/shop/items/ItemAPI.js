import { api_request } from "/js/auth.js";

export async function create(item_data) {
    return await api_request({ 
        type: "POST", url: `/shop/items/`,
        processData: false, contentType: "application/json",
        data: JSON.stringify(item_data)
    });
}

export async function searchItemByBarcode(barcode) {
    return await api_request({ 
        type: "GET", url: `/shop/items/barcode/${encodeURIComponent(barcode)}`
    });
}

export async function searchItemById(item_id) {
    return await api_request({ 
        type: "GET", url: `/shop/items/${encodeURIComponent(item_id)}`
    });
}

export async function updateItem(item_id, item_data) {
    return await api_request({ 
        type: "PUT", url: `/shop/items/${encodeURIComponent(item_id)}/`,
        processData: false, contentType: "application/json",
        data: JSON.stringify(item_data)
    });
}

export async function deleteItem(item_id) {
    return await api_request({ 
        type: "DELETE", url: `/shop/items/${encodeURIComponent(item_id)}/`
    });
}