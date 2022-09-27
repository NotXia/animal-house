/**
 * Restituisce il contenuto HTML di una riga della tabella dei topic
 * @param {Topic}    topic      Dati dei topic
 * @param {integer}  index      Indice della riga
 * @returns HTML della riga
 */
 export function render(topic, index) {
    let escaped_name = he.escape(topic.name);
    let icon;

    // Gestione icona
    if (topic.icon) { icon = `<img src="data:image/*;base64,${topic.icon}" alt="Icona per ${escaped_name}" class="topic-icon" />`; }
    else { icon = `<span class="visually-hidden">Nessuna icona per ${escaped_name}</span>`; }

    return `
        <tr>
            <td class="text-center align-middle">${icon}</td>
            <td class="align-middle">${escaped_name}</td>
            <td class="text-center align-middle">
                <div class="container">
                    <div class="row">
                        <div class="col-sm-12 col-lg-6 mb-2 mb-lg-0 p-0">
                            <button id="modify-btn-${index}" class="btn btn-outline-secondary text-truncate" data-bs-toggle="modal" data-bs-target="#modal-create-topic" aria-label="Modifica i dati del topic ${escaped_name}">Modifica</button>
                        </div>
                        <div class="col-sm-12 col-lg-6 p-0">
                            <button id="delete-btn-${index}" class="btn btn-outline-danger text-truncate" data-bs-toggle="modal" data-bs-target="#modal-delete-topic" aria-label="Elimina il topic ${escaped_name}">Elimina</button>
                        </div>
                    </div>
                </div>
            </td>
        </tr>
    `;
}