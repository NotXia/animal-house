import { Navbar } from "/admin/import/Navbar.js";
import { Loading } from "/admin/import/Loading.js";
import { Error } from "/admin/import/Error.js";
import { api_request, getUsername } from "/js/auth.js";
import * as AppointmentsAPI from "./appointmentsAPI.js";
import { renderAppointment } from "./view/appointmentRow.js";
import { centToPrice } from "/js/utilities.js";

let NavbarHandler;
let LoadingHandler;


let appointments = [];

let selected_service = null;
let selected_hub = null;
let selected_slot = null;
let selected_username = null;
let selected_animal = null;


$(async function () {
    // Caricamento delle componenti esterne
    NavbarHandler = new Navbar("navbar-placeholder");
    LoadingHandler = new Loading("loading-container");
    await LoadingHandler.render();

    await LoadingHandler.wrap(async function () {
        await NavbarHandler.render();

        try {
            // Estrazione degli appuntamenti
            appointments = await AppointmentsAPI.getAppointmentsByUsername(await getUsername());
            appointments.sort( (a1, a2) => moment(a1.time_slot.start).diff(moment(a2.time_slot.start)) );

            await renderAppointments();
        }
        catch (err) {
            $("#error-global").html("Non è stato possibile caricare gli appuntamenti");
        }


        /* Inizializzazione modale prenotazione */

        $("#step-time_slot").hide();
        $("#step-customer").hide();
        $("#step-animal").hide();
        $("#button-modal-submit").prop("disabled", true);

        // Selettore servizio
        try {
            const services_id = (await api_request({ method: "GET", url: `/users/operators/${encodeURIComponent(await getUsername())}` })).services_id;

            for (const service_id of services_id) {
                const service = (await $.ajax({ method: "GET", url: `/services/${service_id}` }));
                $("#container-services").append(`
                    <input id="input-service-${service.id}" class="visually-hidden" type="radio" name="service" value="" required aria-required="true" />
                    <label id="label-service-${service.id}" for="input-service-${service.id}" class="btn btn-outline-dark">${service.name} (${centToPrice(service.price)}€)</label>
                `);

                $(`#input-service-${service.id}`).on("change", () => {
                    $(`label[id^="label-service-"]`).removeClass("active");
                    $(`#label-service-${service.id}`).addClass("active");
                    selected_service = service;

                    resetTimeSelector();
                    resetCustomer();
                    $("#step-time_slot").show();
                });
            }
        }
        catch (err) {
            $("#error-modal").html("Si è verificato un errore");
        }

        // Selettore time slot
        $("#input-day").attr({"min" : moment.utc().format("YYYY-MM-DD")});
        $("#input-day").on("change", async () => {
            $("#container-time_slot").html("");
            $("#error-date").html("");
            selected_hub = null;
            selected_slot = null;
            $("#button-modal-submit").prop("disabled", true);

            const selected_date = $("#input-day").val();
            if (selected_date === "") { return; }

            try {
                // Estrazione disponibilità
                const availabilities = await $.ajax({ 
                    method: "GET", url: `/users/operators/${await getUsername()}/availabilities/`,
                    data: {
                        start_date: `${moment(selected_date, "YYYY-MM-DD").startOf("day").toISOString()}`,
                        end_date: `${moment(selected_date, "YYYY-MM-DD").endOf("day").toISOString()}`,
                        slot_size: selected_service.duration
                    }
                });
                availabilities.sort((a1, a2) => a1.hub.localeCompare(a2.hub) || moment(a1.time.start).diff(moment(a2.time.start)));

                if (availabilities.length === 0) { 
                    $("#error-date").html("Non sono presenti disponibilità");
                    return;
                }

                for (let i=0; i<availabilities.length; i++) {
                    const availability = availabilities[i];

                    $("#container-time_slot").append(`
                        <input id="input-date-${i}" class="visually-hidden" type="radio" name="date" required aria-required="true" />
                        <label id="label-date-${i}" for="input-date-${i}" class="btn btn-outline-dark">${moment.utc(availability.time.start).format("HH:mm")} (${availability.hub})</label>
                    `);

                    $(`#input-date-${i}`).on("change", () => {
                        $(`label[id^="label-date-"]`).removeClass("active");
                        $(`#label-date-${i}`).addClass("active");
    
                        selected_hub = availability.hub;
                        selected_slot = { start: availability.time.start, end: availability.time.end };
                        $("#step-customer").show();    
                        tryToUnlockSubmit();
                    })
                }
            }
            catch (err) {
                $("#error-date").html("Non sono presenti disponibilità");
            }
        });

        // Ricerca utente e animali
        $("#form-search-username").on("submit", async (e) => {
            e.preventDefault();
            $("#container-animals").html("");
            $("#error-customer").html("");
            selected_username = null;
            selected_animal = null;
            $("#button-modal-submit").prop("disabled", true);

            try {
                const username = $("#input-customer-username").val();
                const animals = await ($.ajax({ method: "GET", url: `/users/customers/${username}/animals/` }));
                if (animals.length === 0) {
                    $("#step-animal").hide();
                    $("#error-customer").html("L'utente non ha animali");
                    return;
                }

                $("#step-animal").show();

                for (let i=0; i<animals.length; i++) {
                    const animal = animals[i];

                    $("#container-animals").append(`
                        <input id="input-animal-${i}" class="visually-hidden" type="radio" name="animal" required aria-required="true" />
                        <label id="label-animal-${i}" for="input-animal-${i}" class="btn btn-outline-dark text-truncate">${animal.name} (${animal.species})</label>
                    `);

                    $(`#input-animal-${i}`).on("change", () => {
                        $(`label[id^="label-animal-"]`).removeClass("active");
                        $(`#label-animal-${i}`).addClass("active");

                        selected_username = username;
                        selected_animal = animal;
                        tryToUnlockSubmit();
                    });
                }
            }
            catch (err) {
                $("#step-animal").hide();
                $("#error-customer").html("Utente inesistente");
            }
        });
        
        // Creazione appuntamento
        $("#button-modal-submit").on("click", async () => {
            if (!selected_service || !selected_hub || !selected_slot || !selected_username || !selected_animal) {
                $("#error-modal").html("Ci sono dati mancanti");
                return;
            }

            try {
                const new_appointment = await AppointmentsAPI.createAppointment(selected_username, selected_animal.id, selected_service.id, selected_hub, selected_slot);
                
                appointments.push(new_appointment);
                appointments.sort( (a1, a2) => moment(a1.time_slot.start).diff(moment(a2.time_slot.start)) );
                await renderAppointments();

                $("#modal-appointment").modal("hide");
            }
            catch (err) {
                $("#error-modal").html("Non è stato possibile creare l'appuntamento");
            }
        })
    });

    $("#modal-appointment").on("hidden.bs.modal", () => {
        resetForm();
    })
});


function resetForm() {
    resetServiceSelector();
    resetTimeSelector();
    resetCustomer();
    $("#button-modal-submit").prop("disabled", true);
}

function resetServiceSelector() {
    $(`label[id^="label-service-"]`).removeClass("active");
    $(`input[id^="input-service-"]`).prop("checked", false);
    $("#button-modal-submit").prop("disabled", true);
}

function resetTimeSelector() {
    $("#step-time_slot").hide();
    $("#container-time_slot").html("");
    $("#input-day").val("");
    $("#button-modal-submit").prop("disabled", true);
}

function resetCustomer() {
    $("#step-customer").hide();
    $("#step-animal").hide();
    $("#container-animals").html("");
    $("#input-customer-username").val("");
    $("#button-modal-submit").prop("disabled", true);
}


async function renderAppointments() {
    const appointment_today = appointments.filter((appointment) => moment(appointment.time_slot.start).isSame(moment(), "day"));
    const appointment_tomorrow = appointments.filter((appointment) => moment(appointment.time_slot.start).isSame(moment().add(1, "day"), "day"));
    const appointment_future = appointments.filter((appointment) => moment(appointment.time_slot.start).isSameOrAfter(moment().add(2, "day"), "day"));

    $("#container-appointments-today").html("");
    $("#container-appointments-tomorrow").html("");
    $("#container-appointments-future").html("");

    if (appointment_today.length > 0) {
        $("#container-appointments-today").append(`<h2 class="mt-3 mb-1" aria-label="Appuntamenti di oggi">Oggi</h2>`);
        for (const appointment of appointment_today) { await renderAppointment($("#container-appointments-today"), appointment); }
    }

    if (appointment_tomorrow.length > 0) {
        $("#container-appointments-tomorrow").append(`<h2 class="mt-3 mb-1" aria-label="Appuntamenti di domani">Domani</h2>`);
        for (const appointment of appointment_tomorrow) { await renderAppointment($("#container-appointments-tomorrow"), appointment); }
    }

    if (appointment_future.length > 0) {
        $("#container-appointments-future").append(`<h2 class="mt-3 mb-1" aria-label="Appuntamenti futuri">Prossimamente</h2>`);
        for (const appointment of appointment_future) { await renderAppointment($("#container-appointments-future"), appointment); }
    }
}

function tryToUnlockSubmit() {
    if (!selected_service || !selected_hub || !selected_slot || !selected_username || !selected_animal) {
        return;
    }

    $("#button-modal-submit").prop("disabled", false);
}