import { Navbar } from "/admin/import/Navbar.js";
import { Loading } from "/admin/import/Loading.js";
import { Error } from "/admin/import/Error.js";
import * as CategoryHandler from "./view/categories.js";
import * as SpeciesHandler from "./view/species.js";
import * as Mode from "./mode.js";
import * as Form from "./form.js";
import * as ItemAPI from "./ItemAPI.js";
import * as ProductTab from "./view/productTab.js";
import { createSuccessPopup } from "../../../import/successPopup.js";

let NavbarHandler;
let LoadingHandler;

let item_cache;

window.test = ItemAPI.searchItemByName

$(document).ready(async function() {
    // Caricamento delle componenti esterne
    NavbarHandler = new Navbar("navbar-placeholder");
    LoadingHandler = new Loading("loading-container");
    await LoadingHandler.render();

    await LoadingHandler.wrap(async function() {
        await NavbarHandler.render();
        
        try {
            Mode.start();

            await Form.init();
            await CategoryHandler.init();
            await SpeciesHandler.init();
        }
        catch (err) {
            Mode.error("Si è verificato un errore in fase di inizializzazione");
        }

        $("#form-shop").validate({
            rules: {
                "item.name": { required: true },
                "item.category": { required: true },
                "product.name": { required: true },
                "product.barcode": { required: true },
                "product.price": { required: true, min: 0.01, step: 0.01 },
                "product.quantity": { required: true, min: 0 }
            },
            errorPlacement: function(error, element) {
                Error.showError(element.attr("name"), error);
            },
            submitHandler: async function(form, event) {
                event.preventDefault();

                await LoadingHandler.wrap(async function() {
                    try {
                        const item_data = Form.getItemData();

                        switch (Mode.current) {
                            case Mode.CREATE:
                                item_cache = await ItemAPI.create(item_data);
                                createSuccessPopup("#container-success", `Item ${item_cache.name} creato con successo`);
                                break;

                            case Mode.MODIFY:
                                item_cache = await ItemAPI.updateItem(item_cache.id, item_data);
                                createSuccessPopup("#container-success", `Item ${item_cache.name} modificato con successo`);
                                break;
                        }

                        showItem(item_cache);
                    }
                    catch (err) {
                        switch (err.status) {
                            case 400: Error.showErrors(err.responseJSON); break;
                            case 409: Error.showError(err.responseJSON.field, err.responseJSON.message); break;
                            default: Mode.error(err.responseJSON ? err.responseJSON.message : "Si è verificato un errore"); break;
                        }
                    }
                });
            }
        });

        $("#form-search-item").on("submit", async function (e) {
            e.preventDefault();
            const query_item = $("#input-search-item").val();
            if (query_item === "") { return; }

            await LoadingHandler.wrap(async function() {
                try {
                    let matched_items = [];
                    
                    // Ricerca per barcode
                    let item_by_barcode = await ItemAPI.searchItemByBarcode(query_item).catch((err) => {});
                    item_by_barcode = { item: item_by_barcode, focus: query_item };
                    // Ricerca per nome
                    const item_by_name = (await ItemAPI.searchItemByName(query_item)).map((item) => ({ item: item, focus: null }));

                    // Unione dei risultati
                    matched_items = item_by_name;
                    if (item_by_barcode.item) { matched_items = matched_items.concat(item_by_barcode) }

                    switch (matched_items.length) {
                        case 0: Mode.error(`Nessun item con barcode o nome ${query_item}`); return;
                        case 1: showItem(matched_items[0].item, matched_items[0].focus); break;
                        default:
                            loadItemSelectorModal(matched_items);
                            break;
                    }

                    $("#input-item\\.name").trigger("focus");
                } catch (err) {
                    switch (err.status) {
                        case 404: Mode.error(`Nessun item associato al barcode ${query_item}`); break;
                        default: Mode.error(`Si è verificato un errore`); break;
                    }
                }
            });
        });

        $("#button-start-create").on("click", function () {
            Mode.create();
        });

        $("#button-start-modify").on("click", function () {
            Mode.modify();
        });

        $("#button-revert").on("click", function () {
            showItem(item_cache, ProductTab.currentSelectedBarcode());
        })

        $("#button-delete-item").on("click", async function () {
            await LoadingHandler.wrap(async function() {
                try {
                    await ItemAPI.deleteItem(item_cache.id);
                    createSuccessPopup("#container-success", `Item ${item_cache.name} eliminato con successo`);
                    Mode.start();
                } catch (err) {
                    Mode.error(err.responseJSON.message ? err.responseJSON.message : `Si è verificato un errore`);
                }
            });
            
        });
    });
});


function showItem(item, barcode_to_focus) {
    item_cache = item;

    if (!barcode_to_focus) { barcode_to_focus = item.products[0].barcode; }

    Mode.view();
    Form.loadItemData(item, barcode_to_focus);
    Form.readOnly();
}

/**
 * Gestisce il modale per selezionare l'item se la ricerca produce più risultati
 */
const item_selector_modal = new bootstrap.Modal("#modal-select-item");
function loadItemSelectorModal(items) {
    $("#container-select-item").html("");

    for (const item_struct of items) {
        const item = item_struct.item;
        const focus_data = item_struct.focus;
        let button_id = `button-select-item-${item.id}`;

        const products_barcode_string = item.products.map((product) => product.barcode).join(", ")

        $("#container-select-item").append(`
            <li class="row">
                <button id="${button_id}" class="btn btn-outline-dark mb-1 p-2" data-bs-dismiss="modal">
                    <h3 class="fs-6 fw-semibold mb-0">${item.name}</h3>
                    <p class="mb-0">Barcode contenuti: ${products_barcode_string}</p>
                </button>
            </li>
        `);

        $(`#${button_id}`).on("click", function () { showItem(item, focus_data); });
    }
    item_selector_modal.show();
}