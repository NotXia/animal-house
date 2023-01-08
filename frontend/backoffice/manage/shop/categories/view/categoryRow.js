/**
 * Restituisce il contenuto HTML di una riga della tabella delle categorie
 * @param {Category} category   Dati della categoria
 * @param {integer}  index      Indice della riga
 * @returns HTML della riga
 */
export function render(category, index) {
    let escaped_name = he.escape(category.name);
    let image;

    // Gestione icona
    if (category.icon) { image = `<img src="data:image/*;base64,${category.icon}" alt="Icona per ${escaped_name}" class="category-icon" />`; }
    else               { image = `<span class="visually-hidden">Nessuna icona per ${escaped_name}</span>`; }

    return `
        <tr>
            <td class="text-center align-middle">${image}</td>
            <td class="align-middle">${escaped_name}</td>
            <td class="text-center align-middle">
                <div class="container">
                    <div class="row">
                        <div class="col-sm-12 col-lg-6 mb-2 mb-lg-0 p-0">
                            <button id="modify-btn-${index}" class="btn btn-outline-secondary text-truncate" data-bs-toggle="modal" data-bs-target="#modal-create-category" aria-label="Modifica i dati della categoria ${escaped_name}">Modifica</button>
                        </div>
                        <div class="col-sm-12 col-lg-6 p-0">
                            <button id="delete-btn-${index}" class="btn btn-outline-danger text-truncate" data-bs-toggle="modal" data-bs-target="#modal-delete-category" aria-label="Elimina la categoria ${escaped_name}">Elimina</button>
                        </div>
                    </div>
                </div>
            </td>
        </tr>
    `;
}