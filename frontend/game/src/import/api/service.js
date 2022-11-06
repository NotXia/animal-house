import $ from "jquery";

const ServiceAPI = {
    getServices: async function () {
        return await $.ajax({ 
            method: "GET", 
            url: `${process.env.VUE_APP_DOMAIN}/services/` 
        });
    },
}

export default ServiceAPI;