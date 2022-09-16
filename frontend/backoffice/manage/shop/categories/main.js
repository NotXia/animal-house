import { Navbar } from "/admin/import/Navbar.js";
import { Loading } from "/admin/import/Loading.js";
import { Error } from "/admin/import/Error.js";
import * as CategoryAPI from "./categoryAPI.js";
import * as Mode from "./mode.js";
import * as Form from "./form.js";
import * as CategoryRow from "./view/categoryRow.js";

let NavbarHandler;
let LoadingHandler;

let categories_cache; 

$(document).ready(async function() {
    // Caricamento delle componenti esterne
    NavbarHandler = new Navbar("navbar-placeholder");
    LoadingHandler = new Loading("loading-container");
    await LoadingHandler.render();

    await LoadingHandler.wrap(async function() {
        await NavbarHandler.render();

        $("#form-category").validate({
            rules: {
                name: { required: true }
            },
            errorPlacement: function(error, element) {
                Error.showError(element.attr("name"), error);
            },
            submitHandler: async function(form, event) {
                event.preventDefault();

                await LoadingHandler.wrap(async function() {
                    try {
                        let category_data = await Form.getCategoryData();

                        switch (Mode.current) {
                            case Mode.CREATE:
                                await CategoryAPI.create(category_data);
                                categories_cache = await fetchCategories();
                                clearFilter();
                                break;

                            case Mode.MODIFY:
                                await CategoryAPI.update($("#data-old_name").val(), category_data); 
                                categories_cache = await fetchCategories();
                                filterCategories($("#search-category").val());
                                break;
                        }

                        $("#modal-create-category").modal("hide");
                        $("#search-category").focus();
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

        $("#btn-start_create").on("click", function() {
            Mode.create();
        });
        
        /* Pulizia modal alla chiusura */
        $("#modal-create-category").on("hidden.bs.modal", function (e) {
            Error.clearErrors();
            Form.reset()
        });

        /* Anteprima icona durante upload */
        $("#data-icon").on("change", function (e) { 
            let reader = new FileReader();
            reader.onload = function (e) {
                $("#icon-preview").show();
                $("#icon-preview").attr("src", e.target.result);
            }
            if (this.files[0]) { reader.readAsDataURL(this.files[0]); }
            else { $("#icon-preview").hide(); }
        });
        
        /* Ricerca di categorie */
        let search_delay;
        $("#search-category").on("input", function () {
            clearTimeout(search_delay); // Annulla il timer precedente
            
            search_delay = setTimeout(async function() {
                filterCategories($("#search-category").val());
            }, 100);
        });

        /* Cancellazione di categoria */
        $("#form-category-delete").on("submit", async function (e) {
            e.preventDefault();
            
            await LoadingHandler.wrap(async function() {
                try {
                    await CategoryAPI.remove($("#data-delete-name").val());

                    categories_cache = await fetchCategories();
                    filterCategories($("#search-category").val());
                    $("#search-category").focus();
                }
                catch (err) {
                    switch (err.status) {
                        case 400: Error.showErrors(err.responseJSON); break;
                        case 409: Error.showError(err.responseJSON.field, err.responseJSON.message); break;
                        default: Mode.error(err.responseJSON ? err.responseJSON.message : "Si è verificato un errore"); break;
                    }
                }
            });
        });

        // Caricamento delle categorie
        categories_cache = await fetchCategories();
        displayCategories(categories_cache);
    });

});

/* Estrae tutte le categorie */
async function fetchCategories() {
    try {
        return await CategoryAPI.getAll();
    }
    catch (err) {
        Mode.error(err.responseJSON.message ? err.responseJSON.message : "Si è verificato un errore");
    }
}

/* Filtra le categorie visibili per nome */
function filterCategories(query) {
    if (query === "") {
        displayCategories(categories_cache);
    }
    else {
        const categories = categories_cache.filter((category) => category.name.toLowerCase().includes(query.toLowerCase()));
        displayCategories(categories);
    }
}

/* Resetta il filtro delle categorie */
function clearFilter() {
    displayCategories(categories_cache);
    $("#search-category").val("");
}

/**
 * Mostra a schermo le categorie richieste
 * @param categories    Categorie da visualizzare
 */
function displayCategories(categories) {
    $("#category-container").html("");
    let index = 0;

    for (const category of categories) {
        $("#category-container").append(CategoryRow.render(category, index));

        $(`#modify-btn-${index}`).on("click", function () {
            Mode.modify();

            // Inserisce i dati della riga nel modal
            $("#data-name").val(category.name);
            $("#data-old_name").val(category.name);
            if (category.icon) { 
                $("#icon-preview").show();
                $("#icon-preview").attr("src", `data:image/*;base64,${category.icon}`);
            }
        });

        $(`#delete-btn-${index}`).on("click", function () {
            $("#data-delete-name").val(category.name);
            $("#delete-category-name").text(category.name);
        });

        index++;
    }
}