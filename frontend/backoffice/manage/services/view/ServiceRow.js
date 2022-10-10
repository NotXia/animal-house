import { centToPrice } from "/js/utilities.js";

/**
 * Restituisce il contenuto HTML di una riga della tabella dei servizi
 * @param {Service}     service      Dati dei servizi
 * @param {integer}     index      Indice della riga
 * @returns HTML della riga
 */
export function render(service, index) {
    let escaped_name = he.escape(service.name);
    let price = centToPrice(service.price);
    let onlineIcon = service.online ? `<img src="/img/icons/check.png" alt="Servizio ${escaped_name} online" class="service-online" />` : `<img src="/img/icons/cross.png" alt="Servizio ${escaped_name} offline" class="service-online" />`;

    return `
        <tr>
            <td class="align-middle">${escaped_name}</td>
            <td class="align-middle">${price}</td>
            <td class="align-middle">${onlineIcon}</td>
            <td class="text-center align-middle">
                <div class="container">
                    <div class="row">
                        <div class="col-sm-12 col-lg-6 mb-2 mb-lg-0 p-0">
                            <button id="modify-btn-${index}" class="btn btn-outline-secondary text-truncate" data-bs-toggle="modal" data-bs-target="#modal-create-service" aria-label="Modifica i dati del servizio ${escaped_name}">Modifica</button>
                        </div>
                        <div class="col-sm-12 col-lg-6 p-0">
                            <button id="delete-btn-${index}" class="btn btn-outline-danger text-truncate" data-bs-toggle="modal" data-bs-target="#modal-delete-service" aria-label="Elimina il servizio ${escaped_name}">Elimina</button>
                        </div>
                    </div>
                </div>
            </td>
        </tr>
    `;
}