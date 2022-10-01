import { Navbar } from "/admin/import/Navbar.js";
import { Loading } from "/admin/import/Loading.js";
import { Error } from "/admin/import/Error.js";
import * as CategoryHandler from "./view/categories.js";
import * as SpeciesHandler from "./view/species.js";
import * as Mode from "./mode.js";
import * as Form from "./form.js";
import * as ItemAPI from "./ItemAPI.js";
import * as ProductTab from "./view/productTab.js";

let NavbarHandler;
let LoadingHandler;

let item_cache;

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
                                break;

                            case Mode.MODIFY:
                                item_cache = await ItemAPI.updateItem(item_cache.id, item_data);
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
            const query_barcode = $("#input-search-item").val();
            if (query_barcode === "") { return; }

            await LoadingHandler.wrap(async function() {
                try {
                    Mode.view();

                    const item = await ItemAPI.searchItemByBarcode(query_barcode);
                    showItem(item, query_barcode);
                    $("#input-item\\.name").trigger("focus");
                } catch (err) {
                    switch (err.status) {
                        case 404: Mode.error(`Nessun item associato al barcode ${query_barcode}`); break;
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