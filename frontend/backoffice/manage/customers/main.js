import { Navbar } from "/admin/import/Navbar.js";
import { Loading } from "/admin/import/Loading.js";
import * as Mode from "./mode.js";
import * as Form from "./form.js";
import { createSuccessPopup } from "../../import/successPopup.js";
import { updateURLQuery } from "../../import/url.js";
import { Error } from "../../import/Error.js";
import { api_request } from "/js/auth.js";
import * as AnimalRow from "./view/animalRow.js"

let NavbarHandler;
let LoadingHandler;

let customer_cache = {}; // Mantiene i dati del cliente attualmente visualizzato
let animals_cache;

// Estrazione valori dalla query dell'url
const url_query = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop)
});

$(async function () {
    // Caricamento delle componenti esterne
    NavbarHandler = new Navbar("navbar-placeholder");
    LoadingHandler = new Loading("loading-container");
    await LoadingHandler.render();

    await LoadingHandler.wrap(async function() {
        await NavbarHandler.render();
        Mode.start();

        $("#customer-form").validate({
            rules: {
                username: { required: true },
                password: {
                    required: { depends: (_) => (Mode.current == Mode.CREATE) },
                    securePassword: true
                },
                email: { required: true, email: true },
                name: { required: true },
                surname: { required: true },
                address: { required: true },
                phone: { required: true, phoneNumber: true },
                gender: { required: true }
            },
            errorPlacement: function(error, element) {
                Error.showError(element.attr("name"), error);
            },
            submitHandler: async function(_, event) {
                event.preventDefault();

                await LoadingHandler.wrap(async function () {
                    try {
                        let customer_data = await Form.getCustomerData();
                        let res_customer;

                        switch (Mode.current) {
                            case Mode.MODIFY:
                                res_customer = await api_request({
                                    type: "PUT", url: `/users/customers/${encodeURIComponent(customer_cache.username)}`,
                                    processData: false, contentType: "application/json",
                                    data: JSON.stringify(customer_data)
                                });
                                createSuccessPopup("#container-success", `Cliente ${customer_cache.username} modificato con successo`);

                                break;

                            case Mode.CREATE:
                                res_customer = await api_request({
                                    type: "POST", url: `/users/customers`,
                                    processData: false, contentType: "application/json",
                                    data: JSON.stringify(customer_data)
                                });
                                createSuccessPopup("#container-success", `Cliente ${customer_data.username} creato con successo`);
                                break;
                        }

                        customer_cache = res_customer;
                        Form.loadCustomerData(customer_cache);
                        Mode.view();
                    }
                    catch (err) {
                        switch (err.status) {
                            case 400: Error.showErrors(err.responseJSON); break;
                            case 409: Error.showErrors("Username già in uso"); break;
                            default: Mode.error(err.responseJSON ? err.responseJSON.message : "Si è verificato un errore"); break;
                        }
                    }
                });
            }
        });

        /* Ricerca di un cliente */
        $("#search_user_form").on("submit", async function(e) {
            e.preventDefault();
            const to_search_username = this.username.value;

            await LoadingHandler.wrap(async function() {
                try {
                    // Aggiornamento query dell'URL
                    updateURLQuery("username", to_search_username);

                    // Ricerca e caching cliente
                    const customer_data = await api_request({
                        type: "GET",
                        url: `/users/customers/${encodeURIComponent(to_search_username)}`
                    });
                    customer_cache = customer_data;

                    // Visualizzazione dati
                    Form.loadCustomerData(customer_data);
                    await showAnimals(customer_cache.username);
                    Mode.view();
                } catch (err) {
                    if (err.status === 404) { Mode.error("Utente inesistente"); }
                    else { console.log(err);Mode.error("Si è verificato un errore"); }
                }
            });
        });

        /* Anteprima immagine di profilo caricata */
        $("#data-picture").on("change", function (e) {
            let reader = new FileReader();
            reader.onload = function (e) { $("#profile-picture").attr("src", e.target.result); }
            reader.readAsDataURL(this.files[0]);
        });

        /* Passaggio alla modalità creazione di un cliente */
        $("#start_create-btn").on("click", function (e) {
            resetAnimals();
            Form.resetForm();
            Mode.creation();
        });

        /* Passaggio alla modalità modifica di un cliente */
        $("#modify-btn").on("click", function (e) {
            Mode.modify();
        });

        /* Annulla le modifiche */
        $("#revert-btn").on("click", function (e) {
            Form.loadCustomerData(customer_cache);
            Mode.view();
        });

        /* Cancellazione di un cliente */
        $("#delete-btn").on("click", async function (e) {
            await LoadingHandler.wrap(async function() {
                try {
                    await api_request({
                        type: "DELETE",
                        url: `/users/customers/${encodeURIComponent(customer_cache.username)}`
                    });
                    createSuccessPopup("#container-success", `Cliente ${customer_cache.username} eliminato con successo`);
                } catch (err) {
                    Mode.error(err.responseJSON ? err.responseJSON.message : "Si è verificato un errore");
                }
            });
        });

        // Ricerca eventuale utente richiesto dalla query
        if (url_query.username) {
            $("#search-user-input").val(url_query.username);
            $("#search_user_form").submit();
        }

    });
});

/* Caricamento degli animali dell'utente */
async function showAnimals(username) {
    animals_cache = await fetchAnimals(username);
    displayAnimals(animals_cache);
}

/* Estrae tutti gli animali dell'utente */
async function fetchAnimals(username) {
    try {
        let animals = await api_request({
            type: "GET", url: `/users/customers/${encodeURIComponent(username)}/animals/`
        })

        // Ordinamento alfabetico
        animals.sort((a1, a2) => a1.name.toLowerCase().localeCompare(a2.name.toLowerCase()));

        return animals;
    } catch (err) {
        Mode.error(err.responseJSON.message ? err.responseJSON.message : "Si è verificato un errore");
    }
}

function resetAnimals() {
    $("#animals-container").html("");
}

function displayAnimals(animalsList) {
    $("#animals-container").html("");

    for (const animal of animalsList) {
        $("#animals-container").append(AnimalRow.render(animal));
    }
}