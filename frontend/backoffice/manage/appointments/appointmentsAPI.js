import { api_request, getUsername } from "/js/auth.js";

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

export async function createAppointment(customer, animal_id, service_id, hub, time_slot) {
    await api_request({ 
        type: "POST", url: `/appointments/`,
        data: {
            customer: customer,
            animal_id: animal_id,
            service_id: service_id,
            operator: await getUsername(),
            hub: hub,
            time_slot: time_slot
        }
    });
}