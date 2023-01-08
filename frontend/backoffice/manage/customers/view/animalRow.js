/**
 * Restituisce il contenuto HTML di una riga della tabella degli animali dell'utente
 * @param {Animal} animal       Dati dell'animale
 * @returns HTML della riga
 */
export function render(animal) {
    let escaped_name = he.escape(animal.name);
    let escaped_species = he.escape(animal.species);
    let img;

    // Gestione immagine
    if (animal.image_path) { img = `
        <div class="d-flex justify-content-center align-items-center w-100">
            <div class="d-flex justify-content-center align-items-center" 
            style="border-radius: 50%; height: 12rem; width: 12rem; overflow: hidden;">
                <img src="${animal.image_path}" alt="Immagine di ${escaped_name}", style="max-height: 100%; max-width: 100%;" />
            </div>
        </div>
    `; }
    else { img = `
    <div class="d-flex justify-content-center align-items-center w-100">
        <div class="d-flex justify-content-center align-items-center" 
        style="border-radius: 50%; height: 12rem; width: 12rem; overflow: hidden;">
            <img src="/animals/images/default.png" alt="${escaped_name} non ha un'immagine", style="max-height: 100%; max-width: 100%;" />
        </div>
    </div>
`; }

    return `
        <tr>
            <td class="text-center align-middle">${img}</td>
            <td class="align-middle">${escaped_name}</td>
            <td class="align-middle">${escaped_species}</td>
        </tr>
    `;
}