import { api_request } from "/js/auth.js";

export async function getAppointmentsByUsername(username) {
    let appointments = await api_request({ 
        type: "GET", url: `/appointments/`,
        data: { username: username }
    });

    appointments.sort((a1, a2) => moment(a2.time_slot.start).diff(a1.time_slot.start));

    return appointments;
}

export async function deleteAppointmentsById(id) {
    await api_request({ 
        type: "DELETE", url: `/appointments/${encodeURIComponent(id)}`,
    });
}