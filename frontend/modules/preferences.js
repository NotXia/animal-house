import { getUsername } from "./auth";
import AnimalAPI from "./api/animals";

/**
 * Operazioni sull'access token
 */

const _USER_PREFERENCES_NAME = "user_preferences"


export async function loadUserPreferences() {
    try {
        clearUserPreferences();
        
        const user_animals = await AnimalAPI.getUserAnimals(await getUsername());
        let user_species = new Set();

        user_animals.forEach((animal) => user_species.add(animal.species));
        localStorage.setItem(_USER_PREFERENCES_NAME, JSON.stringify(
            {
                species: [...user_species]
            }
        ));
    }
    catch (err) {
        console.log(err)
    }
}

export function getUserPreferences() {
    try {
        return JSON.parse(localStorage.getItem(_USER_PREFERENCES_NAME));
    }
    catch (err) {
        return null;
    }
}

export function clearUserPreferences() {
    localStorage.removeItem(_USER_PREFERENCES_NAME);
}