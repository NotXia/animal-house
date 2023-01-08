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

export async function searchItemByName(name) {
    let res = [];
    let items = [];
    let index = 0;
    const FETCH_SIZE = 100000;

    // Estrae tutti gli item che contengono il nome (quindi bypassando la paginazione)
    do {
        res = await api_request({ 
            type: "GET", url: `/shop/items/`,
            data: { page_size: FETCH_SIZE, page_number: index, name: name }
        });

        items = items.concat(res);
        index++;
    } while (res.length === FETCH_SIZE);

    return items;
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