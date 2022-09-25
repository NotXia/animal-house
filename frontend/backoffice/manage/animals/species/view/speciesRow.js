/**
 * Restituisce il contenuto HTML di una riga della tabella delle categorie
 * @param {Species} species   Dati della specie
 * @param {integer}  index      Indice della riga
 * @returns HTML della riga
 */
export function render(species, index) {
    let escaped_name = he.escape(species.name);
    let logo;

    // Gestione logo
    if (species.logo) { logo = `<img src="data:image/*;base64,${species.logo}" alt="Icona per ${escaped_name}" class="species-icon" />`; }
    else { logo = `<span class="visually-hidden">Nessuna icona per ${escaped_name}</span>`; }

    return `
        <tr>
            <td class="text-center align-middle">${logo}</td>
            <td class="align-middle">${escaped_name}</td>
            <td class="text-center align-middle">
                <div class="container">
                    <div class="row">
                        <div class="col-sm-12 col-lg-6 mb-2 mb-lg-0 p-0">
                            <button id="modify-btn-${index}" class="btn btn-outline-secondary text-truncate" data-bs-toggle="modal" data-bs-target="#modal-create-species" aria-label="Modifica i dati della specie ${escaped_name}">Modifica</button>
                        </div>
                        <div class="col-sm-12 col-lg-6 p-0">
                            <button id="delete-btn-${index}" class="btn btn-outline-danger text-truncate" data-bs-toggle="modal" data-bs-target="#modal-delete-species" aria-label="Elimina la specie ${escaped_name}">Elimina</button>
                        </div>
                    </div>
                </div>
            </td>
        </tr>
    `;
}