import { Navbar } from "/admin/import/Navbar.js";
import { Loading } from "/admin/import/Loading.js";
import * as Mode from "./mode.js";
import * as Form from "./form.js";
import { createSuccessPopup } from "../../import/successPopup.js";
// import {Error} from "../../import/Error.js";
// import * as Form from "./form.js";
// import { api_request, getUsername } from "/js/auth.js";
// import { updateURLQuery } from "../../import/url.js";

let NavbarHandler;
let LoadingHandler;

let customer_cache = {}; // Mantiene i dati del cliente attualmente visualizzato

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
                        Form.loadCustomerData(res_customer);
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

    });
});