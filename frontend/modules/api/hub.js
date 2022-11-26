import { api_request } from "../auth.js";
import $ from "jquery";
import { DOMAIN } from "../const";

const HubAPI = {
    getNearestFrom: async function (lat, lon, page_size=10, page_number=0, service_id) {
        return await $.ajax({
            method: "GET", url: `${DOMAIN}/hubs/`,
            data: {
                page_size: page_size, page_number: page_number,
                lat: lat, lon: lon,
                service_id: service_id
            }
        });
    },

    getByCode: async function (code) {
        return await $.ajax({
            method: "GET", url: `${DOMAIN}/hubs/${encodeURIComponent(code)}`
        });
    },
}

export default HubAPI;