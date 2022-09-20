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
                "product.price": { required: true },
                "product.quantity": { required: true }
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
                                await ItemAPI.create(item_data);
                                showItem(item_data);
                                break;

                            case Mode.MODIFY:
                                const updated_products = Object.values(item_data.products);
                                delete item_data.products;
                                const findProductByBarcode = (barcode) => updated_products.find(product => product.old_barcode === barcode);

                                // Itero sull'item originale confrontando con i dati aggiornati
                                for (let i=item_cache.products.length-1; i>=0; i--) {
                                    const updated_product = findProductByBarcode(item_cache.products[i].barcode);
                                    
                                    if (updated_product === undefined) {
                                        // Cancellazione prodotto eliminato
                                        await ItemAPI.deleteProductAtIndex(item_cache.id, i);
                                    }
                                    else if (updated_product.old_barcode !== undefined) {
                                        // Aggiornamento prodotto esistente
                                        delete updated_product.old_barcode;
                                        await ItemAPI.updateProductAtIndex(item_cache.id, i, updated_product);
                                        updated_products.splice(i, 1);
                                    }
                                }

                                // I rimanenti sono prodotti nuovi
                                for (const product of updated_products) { await ItemAPI.insertProduct(item_cache.id, product); }

                                // Dati generali item
                                await ItemAPI.updateItem(item_cache.id, item_data);

                                item_cache = await ItemAPI.searchItemById(item_cache.id)
                                showItem(item_cache);
                                break;
                        }
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
    });
});


function showItem(item, barcode_to_focus) {
    item_cache = item;

    if (!barcode_to_focus) { barcode_to_focus = item.products[0].barcode; }

    Mode.view();
    Form.loadItemData(item, barcode_to_focus);
    Form.readOnly();
}