export async function renderAppointment(appointment) {
    const service = await $.ajax({ method: "GET", url: `/services/${encodeURIComponent(appointment.service_id)}` });
    const animal = await $.ajax({ method: "GET", url: `/animals/${encodeURIComponent(appointment.animal_id)}` });
    const customer = await $.ajax({ method: "GET", url: `/users/profiles/${encodeURIComponent(appointment.customer)}` });

    return `
        <div class="col-12 col-md-4">
            <div class="m-2 border rounded p-2 px-3">
                <div class="d-flex justify-content-between">
                    <p class="m-0 fs-5 fw-semibold">${moment(appointment.time_slot.start).format("HH:mm")} - ${moment(appointment.time_slot.end).format("HH:mm")}</p>
                    <p class="m-0 fs-5 fw-semibold">${appointment.hub}</p>
                </div>
                <p class="fs-5">${service.name}</p>
                <p class="m-0">Specie: ${animal.species}</p>
                <div class="d-flex">
                    Animale:
                    <div class="d-flex align-items-center justify-content-center border rounded-circle overflow-hidden mx-1" style="height: 1.5rem; width: 1.5rem">
                        <img src="${animal.image_path}" alt="" class="h-100" />
                    </div>
                    <span class="m-0 text-truncate">${animal.name}</span>
                </div>
                <div class="d-flex">
                    Cliente:
                    <div class="d-flex align-items-center justify-content-center border rounded-circle overflow-hidden mx-1" style="height: 1.5rem; width: 1.5rem">
                        <img src="${customer.picture}" alt="" class="h-100" />
                    </div>
                    <span class="m-0 text-truncate">${customer.name} ${customer.surname}</span>
                </div>
            </div>
        </div>
    `;
}