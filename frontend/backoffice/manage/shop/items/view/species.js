import { api_request } from "/js/auth.js";

/* Inizializzazione dei checkbox per le specie */
export async function init() {
    const all_species = await api_request({ method: "GET", url: "/animals/species/" });

    for (const species of all_species) {
        $("#fieldset-target_species").append(`
            <div class="form-check form-check-inline">
                <input type="checkbox" id="checkbox-target_species-${species.name}" class="form-check-input" name="target_species" value="${species.name}">
                <label class="form-check-label" for="checkbox-target_species-${species.name}">
                    <img src="data:image/*;base64,${species.logo}" alt="" class="ah-icon">
                    ${species.name}
                </label>
            </div>
        `);
    }
}