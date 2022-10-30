import { api_request } from "../auth.js";
import $ from "jquery";

const HubAPI = {
    getNearestFrom: async function (lat, lon, page_size=10, page_number=0) {
        return await $.ajax({
            method: "GET", url: `${process.env.REACT_APP_DOMAIN}/hubs/`,
            data: {
                page_size: page_size, page_number: page_number,
                lat: lat, lon: lon
            }
        });
    }
}

export default HubAPI;