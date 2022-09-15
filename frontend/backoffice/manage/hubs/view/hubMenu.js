let menu_item_callback = () => {};

export function init(item_callback) {
    menu_item_callback = item_callback;
}

export function render(hubs) {
    $("#hub-menu-container").html("");

    hubs = hubs.sort((h1, h2) => h1.code.localeCompare(h2.code));

    for (const hub of hubs) {
        addHubToMenu(hub);
    }
}

export function addHubToMenu(hub) {
    const code = he.encode(hub.code);
    const name = he.encode(hub.name);
    const address = `${he.encode(hub.address.street)} ${he.encode(hub.address.number)}, ${he.encode(hub.address.city)}`;

    $("#hub-menu-container").append(`
        <li class="nav-item mb-2">
            <button id="show-hub-${hub.code}" class="w-100 btn btn-outline-dark">
                <div class="w-100 p-1 text-start">
                    <p class="my-0"><span class="fw-bold" id="menu-hub-code-${hub.code}">${code}</span> <span id="menu-hub-name-${hub.code}">${name}</span></p>
                    <p class="my-0" id="menu-hub-address-${hub.code}">${address}</p>
                </div>
            </button>
        </li>
    `);

    $(`#show-hub-${hub.code}`).on("click", function () {
        menu_item_callback(hub.code);
    });
}

export function updateHubMenu(hub) {
    $(`#menu-hub-code-${hub.code}`).text(hub.code);
    $(`#menu-hub-name-${hub.code}`).text(hub.name);
    $(`#menu-hub-address-${hub.code}`).text(`${hub.address.street} ${hub.address.number}, ${hub.address.city}`);
}