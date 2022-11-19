import $ from "jquery";
import { DOMAIN } from "../const";

const ServiceAPI = {
    getServices: async function (hub_code=undefined) {
        return await $.ajax({ 
            method: "GET", 
            url: `${DOMAIN}/services/`,
            data: {
                hub_code: hub_code
            }
        });
    },

    getServiceById: async function (service_id) {
        return await $.ajax({ 
            method: "GET", 
            url: `${DOMAIN}/services/${encodeURIComponent(service_id)}`
        });
    },
}

export default ServiceAPI;