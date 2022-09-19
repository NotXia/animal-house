import * as TextEditor from "./textEditor.js";
import { FileUpload } from "/admin/import/FileUpload.js";
import { Error } from "/admin/import/Error.js";
import * as ImageInput from "./imageInput.js";

export let product_editor;

let current_product_tab_index = 0;
let tab_indexes_order = []; // Tiene traccia dell'ordine degli indici
let bs_tab_by_index = {};

let tab_products = {};

export async function init() {
    product_editor = await TextEditor.init("#container-product\\.description-editor");
    
    /* Upload di immagini */
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

    /* Aggiunta prodotto */
    $("#button-add-product").on("click", function () {
        if (!$("#container-product-data input").valid()) { return; } // Impedisce di creare nuovi prodotti se quello attuale è invalido
        storeCurrentProduct();
        addProductTab(null, true);
    });

    /* Aggiornamento anteprima nome prodotto */
    $("#input-product\\.name").on("change", function () {
        updateProductTabName()
    });

    /* Cancellazione di prodotti */
    $("#button-start-delete-product").on("click", function () {
        $("#modal-product-name").text($("#input-product\\.name").val());
    });
    $("#button-delete-product").on("click", function () {
        let curr_position = tab_indexes_order.indexOf(current_product_tab_index);
        let to_focus_index = tab_indexes_order[curr_position == 0 ? curr_position+1 : curr_position-1];

        $(`#product-tab-${current_product_tab_index}`).remove();
        delete tab_products[current_product_tab_index];
        tab_indexes_order.splice(curr_position, 1);

        focusOnTab(to_focus_index);
    });
}

export function reset() {
    // Reset editor
    product_editor.setData("");

    // Reset tablist dei prodotti
    $("#container-products-tab").html("");

    // Reset lista immagini caricate
    ImageInput.reset();
}   

/**
 * Gestisce il focus su un determinato prodotto
 * Non gestisce il salvataggio dei dati correnti 
 */
function focusOnTab(index) {
    bs_tab_by_index[index].show(); 

    current_product_tab_index = index;
    loadProductData(tab_products[index]);
}

/**
 * Gestisce il salvataggio dei dati del prodotto attualmente visibile
 */
function storeCurrentProduct() {
    tab_products[current_product_tab_index] = getProductData();
}

/**
 * Aggiunge un tab alla lista dei prodotti
 */
let tab_index = 0;
export function addProductTab(product, focus=false) {
    let index = tab_index;
    tab_index++;

    tab_indexes_order.push(index);

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

    $(`#product-tab-${index}`).on("click", function (e) {
        // Impedisce di cambiare tab prodotto se quello attuale non è valido
        if (!$("#container-product-data input").valid()) { bs_tab_by_index[current_product_tab_index].show(); return; } 

        // Salvataggio del prodotto attualmente visibile
        storeCurrentProduct();

        // Caricamento dei dati del prodotto selezionato
        current_product_tab_index = index;
        loadProductData(tab_products[index]);
    });

    // Inizializzazione tab
    bs_tab_by_index[index] = new bootstrap.Tab($(`#product-tab-${index}`));
    
    // Gestione focus
    if (focus) { focusOnTab(index); }
}

/**
 * Aggiorna l'anteprima dell'immagine del prodotto corrente nella tablist
 */
export function updateProductTabImage() {
    $(`#product-tab-${current_product_tab_index}-image`).attr("src", ImageInput.getFirstData().path);
}
/**
 * Aggiorna l'anteprima del nome del prodotto corrente nella tablist
 */
export function updateProductTabName() {
    $(`#product-tab-${current_product_tab_index}-name`).text($("#input-product\\.name").val());
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

function getProductData() {
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

export function getProductsData() {
    storeCurrentProduct(); // Per avere tutti i dati allineati

    let products = [];
    tab_indexes_order.forEach( (index) => products.push(tab_products[index]) );
    return products;
}

function loadProductData(product) {
    resetProductData();

    $("#input-product\\.barcode").val(product.barcode);
    $("#input-product\\.name").val(product.name);
    product_editor.setData(product.description ? product.description : "");
    $("#input-product\\.price").val(product.price);
    $("#input-product\\.quantity").val(product.quantity);
    if (product.target_species) { product.target_species.forEach((species) => $(`input[name="target_species"][value="${species}"]`).prop("checked", true)); }
    if (product.images) { product.images.forEach((image) => ImageInput.addRow(image.path, image.description)); }

    // Non si può cancellare l'unico prodotto di un item
    if (Object.keys(tab_products).length === 1) { $("#button-start-delete-product").prop("disabled", true); } 
    else { $("#button-start-delete-product").prop("disabled", false); }
}