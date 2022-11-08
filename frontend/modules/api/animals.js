import { api_request } from "../auth.js";
import $ from "jquery";
import { DOMAIN } from "../const";

const CartAPI = {
    getUserAnimals: async function (username) {
        return await api_request({ 
            method: "GET", 
            url: `${DOMAIN}/users/customers/${encodeURIComponent(username)}/animals/` 
        });
    },

    createAnimalForUser: async function (username, animal_data) {
        return await api_request({ 
            method: "POST", 
            url: `${DOMAIN}/users/customers/${encodeURIComponent(username)}/animals/`,
            data: animal_data
        });
    },

    updateAnimalById: async function (animal_id, animal_data) {
        return await api_request({ 
            method: "PUT", 
            url: `${DOMAIN}/animals/${encodeURIComponent(animal_id)}`,
            data: animal_data
        });
    },
}

export default CartAPI;