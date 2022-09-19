import * as TextEditor from "./view/textEditor.js";
import { api_request } from "/js/auth.js";
import { Error } from "/admin/import/Error.js";
import * as ProductTab from "./view/productTab.js";


let item_editor;


export async function init() {
    item_editor = await TextEditor.init("#container-item\\.description-editor");
    await ProductTab.init();
}

export function reset() {
    $("#form-shop").trigger("reset");

    // Reset editor
    item_editor.setData("");
    
    ProductTab.reset();
}   

export function addProductTab(product, focus) {
    ProductTab.addProductTab(product, focus);
}


export function getItemData() {
    return {
        name: $("#input-item\\.name").val(),
        category: $("#input-item\\.category").val(),
        description: item_editor.getData(),
        products: ProductTab.getProductsData()
    }
}