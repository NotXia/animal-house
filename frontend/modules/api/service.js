import $ from "jquery";
import { DOMAIN } from "../const";
import { api_request } from "../auth.js";

const ServiceAPI = {
    getServices: async function (hub_code=undefined) {
        return await api_request({ 
            method: "GET", 
            url: `${DOMAIN}/services/`,
            data: {
                hub_code: hub_code
            }
        });
    },

    getServiceById: async function (service_id) {
        return await api_request({ 
            method: "GET", 
            url: `${DOMAIN}/services/${encodeURIComponent(service_id)}`
        });
    },
}

export default ServiceAPI;