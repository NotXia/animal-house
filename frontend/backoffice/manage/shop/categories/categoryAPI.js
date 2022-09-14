import { api_request } from "/js/auth.js";

export async function getAll() {
    let categories = await api_request({ 
        type: "GET", url: `/shop/categories/`
    });

    // Ordinamento alfabetico
    categories.sort((c1, c2) => (c1.name.toLowerCase() > c2.name.toLowerCase()) ? 1 : ((c2.name.toLowerCase() > c1.name.toLowerCase()) ? -1 : 0));

    return categories;
}

export async function create(category_data) {
    return await api_request({ 
        type: "POST", url: `/shop/categories/`,
        data: category_data
    });
}

export async function update(category_name, updated_data) {
    return await api_request({ 
        type: "PUT", url: `/shop/categories/${encodeURIComponent(category_name)}`,
        data: updated_data
    });
}

export async function remove(category_name) {
    await api_request({ 
        type: "DELETE", url: `/shop/categories/${encodeURIComponent(category_name)}`
    });
}