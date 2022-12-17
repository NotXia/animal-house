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
        console.log(appointments)
        for (const appointment of appointments) {
            $("#container-appointments").append(await renderAppointment(appointment));
        }

    })
})
