import { Navbar } from "/admin/import/Navbar.js";
import { Loading } from "/admin/import/Loading.js";
import { Error } from "/admin/import/Error.js";
import { api_request } from "/js/auth.js";
import * as Form from "./form.js";
import * as Mode from "./mode.js";
import * as SpeciesRow from "./view/speciesRow.js"

let NavbarHandler;
let LoadingHandler;

let species_cache;

$(async function () {
    // Caricamento delle componenti esterne
    NavbarHandler = new Navbar("navbar-placeholder");
    LoadingHandler = new Loading("loading-container");
    await LoadingHandler.render();

    await LoadingHandler.wrap(async function () {
        await NavbarHandler.render();

        $("#form-species").validate({
            rules: {
                name: { required: true }
            },
            errorPlacement: function (error, element) {
                Error.showError(element.attr("name"), error);
            },
            submitHandler: async function (_, event) {
                event.preventDefault();

                await LoadingHandler.wrap(async function () {
                    try {
                        let species_data = await Form.getSpeciesData();

                        switch (Mode.current) {
                            case Mode.CREATE:
                                await api_request({
                                    type: "POST", url: `/animals/species/`,
                                    data: species_data
                                });
                                break;

                            case Mode.MODIFY:
                                let toUpdateSpecies = $("#data-old_name").val()
                                await api_request({
                                    type: "PUT", url: `/animals/species/${encodeURIComponent(toUpdateSpecies)}`,
                                    data: species_data
                                });
                        }
                        await showSpecies();
                    } catch (err) {
                        switch (err.status) {
                            case 400: Error.showErrors(err.responseJSON); break;
                            case 409: Error.showError(err.responseJSON.field, err.responseJSON.message); break;
                            default: Mode.error(err.responseJSON ? err.responseJSON.message : "Si è verificato un errore"); break;
                        }
                    }
                })
            }
        });

        /* Inizio creazione specie */
        $("#btn-start_create").on("click", function () {
            Mode.create();
        });

        /* Pulizia modal alla chiusura */
        $("#modal-create-species").on("hidden.bs.modal", function (e) {
            Error.clearErrors();
            Form.reset()
        });

        /* Anteprima icona durante upload */
        $("#data-logo").on("change", function (e) {
            let reader = new FileReader();
            reader.onload = function (e) {
                $("#logo-preview").show();
                $("#logo-preview").attr("src", e.target.result);
            }
            if (this.files[0]) { reader.readAsDataURL(this.files[0]); }
            else { $("#logo-preview").hide(); }
        });

        /* Ricerca di specie */
        let search_delay;
        $("#search-species").on("input", function() {
            clearTimeout(search_delay); // Annulla il timer precedente

            search_delay = setTimeout(async function() {
                filterSpecies($("#search-species").val());
            }, 100);
        });

        /* Cancellazione specie */
        $("#form-species-delete").on("submit", async function (event) {
            event.preventDefault();
            await LoadingHandler.wrap(async function () {
                try {
                    let toDeleteSpecies = $("#data-delete-name").val();

                    await api_request({
                        type: "DELETE", url: `/animals/species/${encodeURIComponent(toDeleteSpecies)}`,
                    });

                    await showSpecies();
                } catch (err) {
                    switch (err.status) {
                        case 400: Error.showErrors(err.responseJSON); break;
                        default: Mode.error(err.responseJSON ? err.responseJSON.message : "Si è verificato un errore"); break;
                    }
                }
            });
        });

        await showSpecies();
    });


});

// Caricamento delle specie
async function showSpecies() {
    species_cache = await fetchSpecies();
    displaySpecies(species_cache);
}

/* Estrae tutte le specie */
async function fetchSpecies() {
    try {
        let species = await api_request({
            type: "GET", url: `/animals/species/`
        });

        // Ordinamento alfabetico
        species.sort((s1, s2) => s1.name.toLowerCase().localeCompare(s2.name.toLowerCase()));

        return species;
    } catch (err) {
        Mode.error(err.responseJSON.message ? err.responseJSON.message : "Si è verificato un errore");
    }
}

/* Filtra le specie visibili per nome */
function filterSpecies(query) {
    if (!query) {
        displaySpecies(species_cache);
    } else {
        const species = species_cache.filter((species) => species.name.toLowerCase().includes(query.toLowerCase()));
        displaySpecies(species);
    }
}

/**
 * Mostra a schermo delle date specie
 * @param speciesList       Specie da visualizzare
 */
function displaySpecies(speciesList) {
    $("#species-container").html("");
    let index = 0;

    for (const species of speciesList) {
        $("#species-container").append(SpeciesRow.render(species, index));

        $(`#modify-btn-${index}`).on("click", function () {
            Mode.modify();

            $("#data-name").val(species.name);
            $("#data-old_name").val(species.name);
            if (species.logo) {
                $("#logo-preview").show();
                $("#logo-preview").attr("src", `data:image/*;base64,${species.logo}`);
            }
        });

        $(`#delete-btn-${index}`).on("click", function () {
            $("#data-delete-name").val(species.name);
            $("#delete-species-name").text(species.name);
        });

        index++;
    }
}