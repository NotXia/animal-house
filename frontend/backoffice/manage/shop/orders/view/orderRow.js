import { api_request } from "/js/auth.js";
import { centToPrice } from "/js/utilities.js";

const STATUSES = ["pending", "created", "processed", "ready", "delivered", "cancelled"];
const STATUSES_IT = ["in attesa", "creato", "processato", "pronto", "consegnato", "cancellato"];

/**
 * Aggiunge al container in input il contenuto di _render
 * @param {Order}    order          Dati dell'ordine
 * @param {String}   container      Container dove inserire il contenuto
 * @returns HTML della riga
 */
export async function render(order, container) {
    $(container).append(`
        <div id="order-${order.id}" class="row border rounded my-2 py-2">
        </div>
    `);

    await _render(order, `#order-${order.id}`);
}

/**
 * Aggiunge al container in input il contenuto di una riga degli ordini
 * @param {Order}    order          Dati dell'ordine
 * @param {String}   container      Container dove inserire il contenuto
 * @returns HTML della riga
 */
async function _render(order, container) {
    const customer = await api_request({ type: "GET", url: `/users/profiles/${encodeURIComponent(order.customer)}` });

    let address;
    if (order.pickup) {
        const hub = (await api_request({ type: "GET", url: `/hubs/${encodeURIComponent(order.hub_code)}` }));
        address = `${hub.code} - ${hub.address.street} ${hub.address.number}, ${hub.address.postal_code} ${hub.address.city} `;
    }
    else {
        address = `${order.address.street} ${order.address.number}, ${order.address.postal_code} ${order.address.city} `;
    }

    let next_state = `<button id="status-${order.id}" class="btn btn-outline-primary">Passa allo stato successivo</button>`;

    if (order.status === "delivered") {
        next_state = "";
    }

    let vip_logo = moment(customer.vip_until).isSameOrAfter(moment()) ? "<img src='/img/icons/vip.png' alt='' style='height: 1.5rem'><span class='visually-hidden'>Cliente VIP</span>" : "";

    let status_index = STATUSES.indexOf(order.status);

    $(container).append(`
        <div class="col-12 col-md-6">
            <p class="m-0 fw-semibold fs-3">Ordine del ${moment(order.creationDate).format("DD/MM/YYYY, HH:mm")}</p>
            <p class="m-0 fw-semibold fs-4">Cliente: ${customer.name} ${customer.surname} (${customer.username}) ${vip_logo}</p>
            <p class="m-0">${order.pickup ? "Ritiro in sede" : "Consegna a domicilio"}</p>
            <p class="m-0 fw-semibold"><span class="visually-hidden">Indirizzo di consegna: </span>${address}</p>
        </div>
        <div class="col-12 col-md-6 text-end">
            <p class="m-0 fw-semibold fs-4">Stato: ${STATUSES_IT[status_index].toUpperCase()}</p>
            ${next_state}
        </div>
        ${await renderProducts(order.products)}
        <p class="m-0 fw-semibold fs-5 text-end">Totale: ${centToPrice(order.total)}€</p>
    `);

    $(`#status-${order.id}`).on("click", async function () {
        const updated_order = await api_request({ type: "PUT", url: `/shop/orders/${order.id}`, data: { status: STATUSES[status_index+1] } });

        $(container).html("");
        await _render(updated_order, container);
    });
}

/**
 * Genera il codice HTML per una riga della tabella dei prodotti acquistati
 * @param {Object[]} products Lista dei prodotti acquistati 
 * @returns Codice HTML della tabella dei prodotti completa
 */
async function renderProducts(products) {
    let out = `
        <span class="visually-hidden">Contenuto ordine</span>
        <table class='table'>
    `;
    
    out += `<tr>
        <th style="width: 20%">Barcode</th>
        <th style="width: 50%">Prodotto</th>
        <th style="width: 15%">Quantità</th>
        <th style="width: 15%">Prezzo</th>
    </tr>`;

    for (const product of products) {
        out += `
        <tr>
            <td>${product.barcode}</td>
            <td>${product.item_name} (${product.name})</td>
            <td>${product.quantity}</td>
            <td>${centToPrice(product.price)}€</td>
        </tr>`
    }

    out += "</table>";

    return out;
}