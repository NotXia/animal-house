import { Navbar } from "/admin/import/Navbar.js";
import { Loading } from "/admin/import/Loading.js";
import { Error } from "/admin/import/Error.js";
import { api_request, getUsername } from "/js/auth.js";
import * as AppointmentsAPI from "./appointmentsAPI.js";
import { renderAppointment } from "./view/appointmentRow.js";
import { centToPrice } from "/js/utilities.js";

let NavbarHandler;
let LoadingHandler;


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
            // Estrazione degli appuntamento
            const appointments = await AppointmentsAPI.getAppointmentsByUsername(await getUsername());
            appointments.sort( (a1, a2) => moment(a1.time_slot.start).diff(moment(a2.time_slot.start)) );
            const appointment_today = appointments.filter((appointment) => moment(appointment.time_slot.start).isSame(moment(), "day"));
            const appointment_tomorrow = appointments.filter((appointment) => moment(appointment.time_slot.start).isSame(moment().add(1, "day"), "day"));
            const appointment_future = appointments.filter((appointment) => moment(appointment.time_slot.start).isSameOrAfter(moment().add(2, "day"), "day"));
    
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
        catch (err) {

        }


        /* Inizializzazione modale prenotazione */

        // Selettore servizio
        try {
            const services_id = (await api_request({ method: "GET", url: `/users/operators/${encodeURIComponent(await getUsername())}` })).services_id;

            for (const service_id of services_id) {
                const service = (await $.ajax({ method: "GET", url: `/services/${service_id}` }));
                $("#container-services").append(`
                    <button id="button-service-${service.id}" class="btn btn-outline-dark">${service.name} (${centToPrice(service.price)}€)</button>
                `);

                $(`#button-service-${service.id}`).on("click", () => {
                    selected_service = service;
                });
            }
        }
        catch (err) {

        }

        // Selettore time slot
        $("#input-day").attr({"min" : moment.utc().format("YYYY-MM-DD")});
        $("#input-day").on("change", async () => {
            const selected_date = $("#input-day").val();
            try {
                const availabilities = await $.ajax({ 
                    method: "GET", url: `/users/operators/${await getUsername()}/availabilities/`,
                    data: {
                        start_date: `${moment(selected_date, "YYYY-MM-DD").startOf("day").toISOString()}`,
                        end_date: `${moment(selected_date, "YYYY-MM-DD").endOf("day").toISOString()}`,
                        slot_size: selected_service.duration
                    }
                });
                availabilities.sort((a1, a2) => a1.hub.localeCompare(a2.hub) || moment(a1.time.start).diff(moment(a2.time.start)));

                $("#container-time_slot").html("");

                for (let i=0; i<availabilities.length; i++) {
                    const availability = availabilities[i];

                    $("#container-time_slot").append(`
                        <button id="button-date-${i}" class="btn btn-outline-dark m-1">${moment(availability.time.start).format("HH:mm")} (${availability.hub})</button>
                    `);

                    $(`#button-date-${i}`).on("click", () => {
                        selected_hub = availability.hub;
                        selected_slot = { start: availability.time.start, end: availability.time.end };
                    })
                }
            }
            catch (err) {

            }
        });

        // Ricerca utente e animali
        $("#form-search-username").on("submit", async (e) => {
            e.preventDefault();

            try {
                const username = $("#input-customer-username").val();
                const animals = await ($.ajax({ method: "GET", url: `/users/customers/${username}/animals/` }));

                $("#container-animals").html("");

                for (let i=0; i<animals.length; i++) {
                    const animal = animals[i];

                    $("#container-animals").append(`
                        <button id="button-animal-${i}" class="btn btn-outline-dark text-truncate">${animal.name}</button>
                    `);

                    $(`#button-animal-${i}`).on("click", () => {
                        selected_username = username;
                        selected_animal = animal;
                    });
                }
            }
            catch (err) {

            }
        });
        
        $("#button-modal-submit").on("click", async () => {
            if (!selected_service || !selected_hub || !selected_slot || !selected_username || !selected_animal) {
                return;
            }

            try {
                const new_appointment = await AppointmentsAPI.createAppointment(selected_username, selected_animal.id, selected_service.id, selected_hub, selected_slot);
                console.log(new_appointment)
            }
            catch (err) {

            }
        })
    });
})
