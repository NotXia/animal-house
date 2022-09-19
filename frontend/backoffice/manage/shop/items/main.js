import { Navbar } from "/admin/import/Navbar.js";
import { Loading } from "/admin/import/Loading.js";
import { Error } from "/admin/import/Error.js";
import * as CategoryHandler from "./view/categories.js";
import * as SpeciesHandler from "./view/species.js";
import * as Mode from "./mode.js";
import * as Form from "./form.js";
import * as ItemAPI from "./ItemAPI.js";

let NavbarHandler;
let LoadingHandler;


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
                        switch (Mode.current) {
                            case Mode.CREATE:
                                const item = Form.getItemData();
                                await ItemAPI.create(item);
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

        $("#button-start-create").on("click", function () {
            Mode.create();
        })

        $("#form-search-item").on("submit", async function (e) {
            e.preventDefault();
            const query_barcode = $("#input-search-item").val();
            if (query_barcode === "") { return; }

            await LoadingHandler.wrap(async function() {
                try {
                    const item = await ItemAPI.searchItemByBarcode(query_barcode);

                    Mode.view();
                    Form.loadItemData(item, query_barcode);
                    Form.readOnly();
                } catch (err) {
                    switch (err.status) {
                        case 404: Mode.error(`Nessun item associato al barcode ${query_barcode}`); break;
                        default: Mode.error(`Si è verificato un errore`); break;
                    }
                }
            });

        });
    });
});