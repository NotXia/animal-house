import * as TextEditor from "./view/textEditor.js";
import { api_request } from "/js/auth.js";
import { FileUpload } from "/admin/import/FileUpload.js";
import { Error } from "/admin/import/Error.js";
import * as ImageInput from "./view/imageInput.js";

export let item_editor;
export let product_editor;

let current_product_tab_index = 0;
let tab_products = {};

export async function init() {
    item_editor = await TextEditor.init("#container-item\\.description-editor");
    product_editor = await TextEditor.init("#container-product\\.description-editor");

    $("#input-upload-images").on("change", async function () {
        if ($(this)[0].files.length <= 0) { return; }

        $("#loading-upload-images").show();
        let upload_data = new FormData();
        let uploaded_images;
        
        // Preparazione payload e upload
        for (let i=0; i<$(this)[0].files.length; i++) {
            upload_data.append(`file${i}`, $(this)[0].files[i]);
        }
        uploaded_images = await FileUpload.upload(upload_data).catch((err) => { Error.showError("product.images", "Non è stato possibile caricare i file"); });

        // Aggiunta righe per descrizione
        uploaded_images.forEach((image_path) => { ImageInput.addRow(image_path); });

        updateProductTabImage(); // Aggiornamento anteprima prodotto nella tablist

        $(this).val("");
        $("#loading-upload-images").hide();
    });
}

export function reset() {
    $("#form-shop").trigger("reset");

    // Reset editor
    item_editor.setData("");
    product_editor.setData("");

    // Reset tablist dei prodotti
    $("#container-products-tab").html("");

    // Reset lista immagini caricate
    ImageInput.reset();
}   


/**
 * Aggiunge un tab alla lista dei prodotti
 */
let tab_index = 0;
export function addProductTab(product, focus=false) {
    let index = tab_index;
    tab_index++;

    // Salvataggio/Creazione dati del tab
    tab_products[index] = product ? product : {};

    // Gestione dati di default da visualizzare
    if (!product) { product = { name: "&nbsp", images: ["/shop/images/default.png"] } }

    $("#container-products-tab").append(`
        <button id="product-tab-${index}" class="btn btn-outline-dark mx-1" type="button" role="tab" data-bs-toggle="pill">
            <div id="product-tab-${index}-name" class="product-tab-name-container text-truncate">${product.name}</div>
            <div class="d-flex justify-content-center align-items-center product-tab-image-container">
                <img id="product-tab-${index}-image" class="product-tab-image" src="${product.images[0]}" alt="">
            </div>
        </button>
    `);

    // Inizializzazione tab
    const tab = new bootstrap.Tab($(`#product-tab-${index}`));
    if (focus) { tab.show(); }

    $(`#product-tab-${index}`).on("click", function () {
        // Salvataggio del prodotto attualmente visibile
        tab_products[current_product_tab_index] = getProductData();

        // Caricamento dei dati del prodotto selezionato
        current_product_tab_index = index;
        loadProductData(tab_products[index]);
    });
}

/**
 * Aggiorna l'anteprima dell'immagine del prodotto corrente nella tablist
 */
export function updateProductTabImage() {
    $(`#product-tab-${current_product_tab_index}-image`).attr("src", ImageInput.getFirstData().path);
}


function resetProductData() {
    $("#input-product\\.barcode").val("");
    $("#input-product\\.name").val("");
    product_editor.setData("");
    $("#input-product\\.price").val("");
    $("#input-product\\.quantity").val("");
    $(`input[name="target_species"]`).prop("checked", false);
    ImageInput.reset();
}

export function getProductData() {
    return {
        barcode: $("#input-product\\.barcode").val(),
        name: $("#input-product\\.name").val(),
        description: product_editor.getData(),
        target_species: $.map($("input[name='target_species']:checked"), (checkbox) => $(checkbox).val()),
        price: $("#input-product\\.price").val(),
        quantity: $("#input-product\\.quantity").val(),
        images: ImageInput.getImagesData()
    };
}

export function loadProductData(product) {
    resetProductData();

    $("#input-product\\.barcode").val(product.barcode);
    $("#input-product\\.name").val(product.name);
    product_editor.setData(product.description ? product.description : "");
    $("#input-product\\.price").val(product.price);
    $("#input-product\\.quantity").val(product.quantity);
    if (product.target_species) { product.target_species.forEach((species) => $(`input[name="target_species"][value="${species}"]`).prop("checked", true)); }
    if (product.images) { product.images.forEach((image) => ImageInput.addRow(image.path, image.description)); }
}