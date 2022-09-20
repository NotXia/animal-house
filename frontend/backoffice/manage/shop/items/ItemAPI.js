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
        type: "GET", url: `/shop/items/barcode/${barcode}`
    });
}

export async function searchItemById(item_id) {
    return await api_request({ 
        type: "GET", url: `/shop/items/${item_id}`
    });
}

export async function deleteProductAtIndex(item_id, index) {
    await api_request({ 
        type: "DELETE", url: `/shop/items/${item_id}/products/${index}`
    });
}

export async function updateProductAtIndex(item_id, index, product_data) {
    return await api_request({ 
        type: "PUT", url: `/shop/items/${item_id}/products/${index}`,
        processData: false, contentType: "application/json",
        data: JSON.stringify(product_data)
    });
}

export async function insertProduct(item_id, product_data) {
    return await api_request({ 
        type: "POST", url: `/shop/items/${item_id}/products/`,
        processData: false, contentType: "application/json",
        data: JSON.stringify(product_data)
    });
}

export async function updateItem(item_id, item_data) {
    return await api_request({ 
        type: "PUT", url: `/shop/items/${item_id}/`,
        processData: false, contentType: "application/json",
        data: JSON.stringify(item_data)
    });
}