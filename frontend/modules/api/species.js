import $ from "jquery";
import { DOMAIN } from "../const";

const SpeciesAPI = {
    getSpecies: async function () {
        return await $.ajax({ 
            method: "GET", 
            url: `${DOMAIN}/animals/species/` 
        });
    },
}

export default SpeciesAPI;