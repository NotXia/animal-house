import {api_request} from "/js/auth.js";

export async function get(page_size=1000, page_number=0) {
    return await api_request({
        method: "GET", url: "/hubs/",
        data: { page_size: page_size, page_number: page_number }
    });
}

export async function modify(hub_code, updated_data) {
    return await api_request({ 
        type: "PUT", url: `/hubs/${encodeURIComponent(hub_code)}`,
        processData: false, contentType: "application/json",
        data: JSON.stringify(updated_data)
    });
}

export async function create(hub_data) {
    return await api_request({
        type: "POST", url: `/hubs/`,
        processData: false, contentType: "application/json",
        data: JSON.stringify(hub_data)
    });
}

export async function remove(hub_code) {
    await api_request({
        type: "DELETE", url: `/hubs/${hub_code}`
    });
}