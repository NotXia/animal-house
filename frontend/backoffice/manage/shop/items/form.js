import * as TextEditor from "./view/textEditor.js";

export let item_editor;
export let product_editor;

export async function init() {
    item_editor = await TextEditor.init("#container-item\\.description-editor");
    product_editor = await TextEditor.init("#container-product\\.description-editor");
}

export function reset() {
    $("#form-shop").trigger("reset");

    // Reset editor
    item_editor.setData("");
    product_editor.setData("");

    // Reset tablist dei prodotti
    $("#container-products-tab").html("");

    // Reset lista immagini caricate
    $("#container-uploaded_images").html("");
}