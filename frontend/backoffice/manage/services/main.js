import { Navbar } from "/admin/import/Navbar.js";
import { Loading } from "/admin/import/Loading.js";
import { Error } from "/admin/import/Error.js";
import { api_request } from "/js/auth.js";
import { centToPrice } from "/js/utilities.js";
import * as Form from "./form.js";
import * as Mode from "./mode.js";
import * as ServiceRow from "./view/serviceRow.js";

let NavbarHandler;
let LoadingHandler;

let service_cache;

$(async function () {
    // Caricamento delle componenti esterne
    NavbarHandler = new Navbar("navbar-placeholder");
    LoadingHandler = new Loading("loading-container");
    await LoadingHandler.render();

    await LoadingHandler.wrap(async function () {
        await NavbarHandler.render();

        displaySpecies();
        $("#form-service").validate({
            rules: {
                name: { required: true },
                description: { required: true },
                duration: { required: true, min: 1, step: 1 },
                price: { required: true, min: 0.01, step: 0.01 },
            },
            errorPlacement: function (error, element) {
                Error.showError(element.attr("name"), error);
            },
            submitHandler: async function (_, event) {
                event.preventDefault();

                await LoadingHandler.wrap(async function() {
                    try {
                        let service_data = Form.getServiceData();

                        switch (Mode.current) {
                            case Mode.CREATE:
                                await api_request({
                                    type: "POST", url: `/services/`,
                                    data: service_data
                                });
                                break;

                            case Mode.MODIFY:
                                let toUpdateService = $("#data-old_id").val();
                                await api_request({
                                    type: "PUT", url: `/services/${encodeURIComponent(toUpdateService)}`,
                                    data: service_data
                                })
                        }

                        $("#modal-create-service").modal("hide");
                        await showServices();
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

        /* Inizio creazione servizio */
        $("#btn-start_create").on("click", function() {
            Mode.create();
        });

        /* Pulizia modal alla chiusura */
        $("#modal-create-service").on("hidden.bs.modal", function (_) {
            Error.clearErrors();
            Form.reset();
        })

        /* Ricerca di servizi */
        let search_delay;
        $("#search-service").on("input", function () {
            clearTimeout(search_delay); // Annulla il timer precedente

            search_delay = setTimeout(async function () {
                filterService($("#search-service").val());
            }, 100);
        });

        /* Cancellazione servizio */
        $("#form-service-delete").on("submit", async function (event) {
            event.preventDefault();
            await LoadingHandler.wrap(async function () {
                try {
                    let toDeleteService = $("#data-delete-id").val();

                    await api_request({
                        type: "DELETE", url: `/services/${encodeURIComponent(toDeleteService)}` 
                    });

                    await showServices();
                } catch (err) {
                    switch (err.status) {
                        case 400: Error.showErrors(err.responseJSON); break;
                        default: Mode.error(err.responseJSON ? err.responseJSON.message : "Si è verificato un errore"); break;
                    }
                }
            })
        })
        
        await showServices();
    })
})

/* Caricamento dei servizi */
async function showServices() {
    service_cache = await fetchServices();
    displayServices(service_cache);
}

/* Estrae tutti i servizi */
async function fetchServices() {
    try {
        let service = await $.ajax({
            type: "GET", url: `/services/`
        })

        // Ordinamento alfabetico
        service.sort((s1, s2) => s1.name.toLowerCase().localeCompare(s2.name.toLowerCase()));

        return service;
    } catch (err) {
        Mode.error(err.responseJSON.message ? err.responseJSON.message : "Si è verificato un errore");
    }
}

/* Filtra i servizi visibili per nome */
function filterService(query) {
    if (!query) {
        displayServices(service_cache);
    } else {
        const services = service_cache.filter((service) => service.name.toLowerCase().includes(query.toLowerCase()));
        displayServices(services);
    }
}

/**
 * Mostra a schermo dei dati servizi
 * @param serviceList   Servizi da visualizzare
 */
function displayServices(serviceList) {
    $("#service-container").html("");
    let index = 0;

    for (const service of serviceList) {
        $("#service-container").append(ServiceRow.render(service, index));

        $(`#modify-btn-${index}`).on("click", function () {
            Mode.modify();

            $("#data-old_id").val(service.id);
            $("#data-name").val(service.name);
            $("#data-description").val(service.description);
            $("#data-duration").val(service.duration);
            $("#data-price").val(
                parseFloat(centToPrice(service.price).replace(',','.').replace(' ','')));
            if(service.online) {
                $("#data-online").prop("checked", true);
            }
            for (const species in service.target) {
                $(`#data-${service.target[species]}`).prop("checked", true);
            }
        });

        $(`#delete-btn-${index}`).on("click", function() {
            $("#data-delete-id").val(service.id);
            $("#delete-service-name").text(service.name);
        })
        index++;
    }
}

/* Estrae le specie */
async function fetchSpecies() {
    try {
        let species = await $.ajax({
            type: "GET", url: `/animals/species/`
        })

        // Ordinamento alfabetico
        species.sort((s1, s2) => s1.name.toLowerCase().localeCompare(s2.name.toLowerCase()));

        return species;
    } catch (err) {
        Mode.error(err.responseJSON.message ? err.responseJSON.message : "Si è verificato un errore");
    }
}

/* Mostra a schermo le specie */
async function displaySpecies() {
    try {
        let speciesList = await fetchSpecies();
        
        for (const species of speciesList) {
            let speciesLogo = "";
            if (species.logo) {
                speciesLogo = `<img src="data:image/*;base64,${species.logo}" alt="Icona per ${species.name}" class="species-icon" />`;
            }

            $("#data-target").append(`
            <div class="form-check form-check-inline">
                <input class="form-check-input" type="checkbox" id="data-${species.name}" name="target" aria-label="Specie ${species.name}" value="${species.name}">
                <label for="data-${species.name}" class="fs-6 fw-semibold">
                    ${speciesLogo}
                    ${species.name}
                </label>
            </div>
            `);
        }
        
    } catch (err) {
        Mode.error(err.responseJSON.message ? err.responseJSON.message : "Si è verificato un errore");
    }
}