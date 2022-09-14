import { Navbar } from "/admin/import/Navbar.js";
import { Loading } from "/admin/import/Loading.js";
import {Error} from "/admin/import/Error.js";
import * as CategoryAPI from "./categoryAPI.js";
import * as Mode from "./mode.js";
import * as Form from "./form.js";

let NavbarHandler;
let LoadingHandler;

let categories_cache; 

$(document).ready(async function() {
    NavbarHandler = new Navbar("navbar-placeholder");
    LoadingHandler = new Loading("loading-container");
    await LoadingHandler.render();

    await LoadingHandler.wrap(async function() {
        await NavbarHandler.render();

        $("#form-category-insert").validate({
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
            $("#icon-preview").hide();
            $("#form-category-insert").trigger("reset");
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
            showLoading();

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
        let escaped_name = he.escape(category.name);

        // Gestione icona
        let image = `<img src="data:image/*;base64,${category.icon}" alt="Icona per ${escaped_name}" class="category-icon" />`;
        if (!category.icon) { image = `<span class="visually-hidden">Nessuna icona per ${escaped_name}</span>`; }

        $("#category-container").append(`
            <tr>
                <td class="text-center align-middle"> ${image} </td>
                <td class="align-middle">${escaped_name}</td>
                <td class="text-center align-middle">
                    <div class="container">
                        <div class="row">
                            <div class="col-sm-12 col-lg-6 mb-2 mb-lg-0 p-0">
                                <button id="modify-btn-${index}" class="btn btn-outline-secondary text-truncate" data-bs-toggle="modal" data-bs-target="#modal-create-category" aria-label="Modifica i dati della categoria ${escaped_name}">Modifica</button>
                            </div>
                            <div class="col-sm-12 col-lg-6 p-0">
                                <button id="delete-btn-${index}" class="btn btn-outline-danger text-truncate" data-bs-toggle="modal" data-bs-target="#modal-delete-category" aria-label="Elimina la categoria ${escaped_name}">Elimina</button>
                            </div>
                        </div>
                    </div>
                </td>
            </tr>
        `);

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