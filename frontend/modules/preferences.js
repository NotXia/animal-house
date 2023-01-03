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
        
        localStorage.setItem(_USER_PREFERENCES_NAME, JSON.stringify(
            {
                animals: user_animals,
                species: getSpeciesFromAnimals(user_animals)
            }
        ));
    }
    catch (err) {
        console.log(err)
    }
}

export function getUserPreferences() {
    try {
        let preferences = JSON.parse(localStorage.getItem(_USER_PREFERENCES_NAME));
        return preferences ?? {};
    }
    catch (err) {
        return {};
    }
}

export function clearUserPreferences() {
    localStorage.removeItem(_USER_PREFERENCES_NAME);
}

export const updateUserPreferences = {
    animals: {
        create: (animal) => {
            let curr_preferences = getUserPreferences();
            if (!curr_preferences.animals) { curr_preferences.animals = []; }

            // Aggiunta animale e aggiornamento specie
            curr_preferences.animals.push(animal);
            curr_preferences.species = getSpeciesFromAnimals(curr_preferences.animals);

            localStorage.setItem(_USER_PREFERENCES_NAME, JSON.stringify(curr_preferences));
        },

        update: (updated_animal) => {
            let curr_preferences = getUserPreferences();
            if (!curr_preferences) { curr_preferences = {}; }
            if (!curr_preferences.animals) { curr_preferences.animals = []; }

            // Aggiornamento animale
            for (let i=0; i<curr_preferences.animals.length; i++) {
                const animal = curr_preferences.animals[i];

                if (animal.id === updated_animal.id) {
                    curr_preferences.animals[i] = updated_animal;
                    break;
                }
            }
            // Aggiornamento specie
            curr_preferences.species = getSpeciesFromAnimals(curr_preferences.animals);

            localStorage.setItem(_USER_PREFERENCES_NAME, JSON.stringify(curr_preferences));
        },

        delete: (to_delete_animal) => {
            let curr_preferences = getUserPreferences();
            if (!curr_preferences.animals) { curr_preferences.animals = []; }

            // Cancellazione animale e aggiornamento specie
            curr_preferences.animals = curr_preferences.animals.filter((animal) => animal.id !== to_delete_animal.id);
            curr_preferences.species = getSpeciesFromAnimals(curr_preferences.animals);

            localStorage.setItem(_USER_PREFERENCES_NAME, JSON.stringify(curr_preferences));
        }
    }
}


function getSpeciesFromAnimals(animals) {
    let species = new Set();

    animals.forEach((animal) => species.add(animal.species));

    return [...species];
}