import { Navbar } from "/admin/import/Navbar.js";
import { Loading } from "/admin/import/Loading.js";
import { Error } from "/admin/import/Error.js";
import { api_request, getUsername } from "/js/auth.js";
import * as AppointmentsAPI from "./appointmentsAPI.js"
import { renderAppointment } from "./view/appointmentRow.js"

let NavbarHandler;
let LoadingHandler;

$(async function () {
    // Caricamento delle componenti esterne
    NavbarHandler = new Navbar("navbar-placeholder");
    LoadingHandler = new Loading("loading-container");
    await LoadingHandler.render();

    await LoadingHandler.wrap(async function () {
        await NavbarHandler.render();

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
    });
})
