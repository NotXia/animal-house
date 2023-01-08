let menu_item_callback = () => {};

export function init(item_callback) {
    menu_item_callback = item_callback;
}

export function render(hubs, selected, focus_on_selected=true) {
    $("#hub-menu-container").html("");

    for (const hub of hubs) {
        addHubToMenu(hub);
    }

    if (selected) {
        if (focus_on_selected) {
            bootstrap.Tab.getInstance($(`#hub-menu-container button[id*=${selected}]`)).show();
        }
        else {
            $(`#show-hub-${selected}`).addClass("active");
            $(`#show-hub-${selected}`).attr("aria-selected", true);
            $(`#show-hub-${selected}`).attr("tabindex", 0);
        }
    }
}

export function addHubToMenu(hub) {
    const code = he.encode(hub.code);
    const name = he.encode(hub.name);
    const address = `${he.encode(hub.address.street)} ${he.encode(hub.address.number)}, ${he.encode(hub.address.city)}`;

    $("#hub-menu-container").append(`
        <li class="nav-item mb-2 w-100" role="presentation">
            <button id="show-hub-${hub.code}" class="w-100 btn btn-outline-dark" data-bs-toggle="tab" role="tab" aria-labelledby="hub-menu-${hub.code}-label">
                <div class="w-100 p-1 text-start" id="hub-menu-${hub.code}-label">
                    <p class="visually-hidden">Premi per visualizzare i dati di:</p>
                    <p class="my-0 text-truncate"><span class="fw-bold" id="menu-hub-code-${hub.code}">${code}</span> <span id="menu-hub-name-${hub.code}">${name}</span></p>
                    <p class="my-0 text-truncate" id="menu-hub-address-${hub.code}">${address}</p>
                </div>
            </button>
        </li>
    `);

    new bootstrap.Tab($(`#show-hub-${hub.code}`));

    $(`#show-hub-${hub.code}`).on("click", function () {
        menu_item_callback(hub.code);
    });
}

export function updateHubMenu(hub) {
    $(`#menu-hub-code-${hub.code}`).text(hub.code);
    $(`#menu-hub-name-${hub.code}`).text(hub.name);
    $(`#menu-hub-address-${hub.code}`).text(`${hub.address.street} ${hub.address.number}, ${hub.address.city}`);
}