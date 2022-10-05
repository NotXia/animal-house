import {api_request} from "/js/auth.js";

/* Inizializzazione della lista di categorie */
export async function init() {
    const categories = await api_request({ method: "GET", url: "/shop/categories/" });
    
    for (const category of categories) {
        $("#input-item\\.category").append(`<option value="${category.name}">${he.encode(category.name)}</option>`);
    }
}