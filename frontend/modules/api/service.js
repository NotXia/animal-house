import $ from "jquery";
import { DOMAIN } from "../const";

const ServiceAPI = {
    getServices: async function () {
        return await $.ajax({ 
            method: "GET", 
            url: `${DOMAIN}/services/` 
        });
    },
}

export default ServiceAPI;