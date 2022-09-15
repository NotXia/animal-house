import {api_request} from "/js/auth.js";

export async function get(page_size=20, page_number=0) {
    return await api_request({
        method: "GET", url: "/hubs/",
        data: { page_size: page_size, page_number: page_number }
    });
}

export async function modify(hub_code, updated_data) {
    return await api_request({ 
        type: "PUT", url: `/hubs/${encodeURIComponent(hub_code)}`,
        data: updated_data
    });
}