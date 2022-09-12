export async function update(username, operator_data) {
    return await api_request({ 
        type: "PUT", url: `/users/operators/${encodeURIComponent(username)}`,
        processData: false, contentType: "application/json",
        data: JSON.stringify(operator_data)
    });
}

export async function create(operator_data) {
    return await api_request({ 
        type: "POST", url: `/users/operators/`,
        processData: false, contentType: "application/json",
        data: JSON.stringify(operator_data)
    });
}

export async function search(username) {
    return await api_request({ 
        type: "GET", 
        url: `/users/operators/${encodeURIComponent(username)}` 
    });
}

export async function remove(username) {
    await api_request({
        type: "DELETE", 
        url: `/users/operators/${encodeURIComponent(username)}`
    });
}