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
}

export default ServiceAPI;