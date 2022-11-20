import { api_request } from "../auth.js";
import $ from "jquery";
import { DOMAIN } from "../const";

const BookingAPI = {
    getAvailabilitiesOfDate: async function (date, hub_code, service_id) {
        return await api_request({ 
            method: "GET", 
            url: `${DOMAIN}/appointments/availabilities/`,
            data: {
                start_date: date,
                end_date: date,
                hub_code: hub_code,
                service_id: service_id
            }
        });
    },

    createAppointment: async function (appointment) {
        return await api_request({ 
            method: "POST", 
            url: `${DOMAIN}/appointments/`,
            data: appointment
        });
    },

    startPaymentById: async function (appointment_id) {
        return await api_request({ 
            method: "POST", 
            url: `${DOMAIN}/appointments/${encodeURIComponent(appointment_id)}/checkout`
        });
    },

    confirmPayment: async function (appointment_id) {
        return await api_request({ 
            method: "POST", 
            url: `${DOMAIN}/appointments/${encodeURIComponent(appointment_id)}/success`
        });
    },

    getAppointmentById: async function (appointment_id) {
        return await api_request({ 
            method: "GET", 
            url: `${DOMAIN}/appointments/${encodeURIComponent(appointment_id)}`
        });
    }
}

export default BookingAPI;