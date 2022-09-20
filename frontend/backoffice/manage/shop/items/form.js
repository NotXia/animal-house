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

export function loadItemData(item, barcode_to_focus) {
    $("#input-item\\.name").val(item.name);
    $("#input-item\\.category").val(item.category);
    item_editor.setData(item.description);

    if (!barcode_to_focus) { barcode_to_focus = item.products[0].barcode }
    for (const product of item.products) {
        ProductTab.addProductTab(product, product.barcode === barcode_to_focus);
    }
}


export function readOnly() {
    $("#form-shop input, #form-shop textarea").readonly(true);
    item_editor.enableReadOnlyMode("item_editor");
    ProductTab.product_editor.enableReadOnlyMode("product_editor");

    $("#button-add-product").prop("disabled", true);
    $("#button-start-delete-product").prop("disabled", true);
    $("[id*='button-image_row-delete-']").prop("disabled", true);

    $("#input-upload-images").prop("disabled", true);
    $("#input-item\\.category").attr("style", "pointer-events: none;");
    $("#input-item\\.category").attr("aria-readonly", true);
}

export function enable() {
    $("#form-shop input, #form-shop textarea").readonly(false);
    item_editor.disableReadOnlyMode("item_editor");
    ProductTab.product_editor.disableReadOnlyMode("product_editor");

    $("#button-add-product").prop("disabled", false);
    $("#button-start-delete-product").prop("disabled", false);
    $("[id*='button-image_row-delete-']").prop("disabled", false);

    $("#input-upload-images").prop("disabled", false);
    $("#input-item\\.category").attr("style", "");
    $("#input-item\\.category").attr("aria-readonly", false);
}

function resetSubmitButtons() {
    $("div[id*='container-submit_button-'] button").attr("type", "button");
    $("div[id*='container-submit_button-']").hide();
}

export function createMode() {
    $("#form-shop").show();
    reset();
    enable();
    addProductTab(null, true);

    resetSubmitButtons();
    $("#button-create").attr("type", "submit");
    $("#container-submit_button-create").show();
}

export function viewMode() {
    $("#form-shop").show();
    reset();
    readOnly();

    resetSubmitButtons();
    $("#container-submit_button-start-modify").show();
}

export function modifyMode() {
    $("#form-shop").show();
    enable();
    ProductTab.updateDeleteProductButton();

    resetSubmitButtons();
    $("#button-modify").attr("type", "submit");
    $("#container-submit_button-modify").show();
}