import * as AppointmentAPI from "../appointmentsAPI.js";

export async function renderAppointment(container, appointment) {
    const service = await $.ajax({ method: "GET", url: `/services/${encodeURIComponent(appointment.service_id)}` });
    const animal = await $.ajax({ method: "GET", url: `/animals/${encodeURIComponent(appointment.animal_id)}` });
    const customer = await $.ajax({ method: "GET", url: `/users/profiles/${encodeURIComponent(appointment.customer)}` });

    let vip_logo = `
        <img src="/img/icons/vip.png" alt="" style="height: 1.3rem" />
        <span class="visually-hidden">Cliente VIP</span>
    `;
    if (moment(customer.vip_until).isBefore(moment())) { vip_logo = ""; }

    $(container).append(`
        <div class="col-12 col-md-4" id="container-${appointment.id}">
            <div class="visually-hidden">
                <p>
                    ${service.name} per il giorno ${moment.utc(appointment.time_slot.start).format("DD/MM/YYYY")}
                    dalle ${moment.utc(appointment.time_slot.start).format("HH:mm")} alle ${moment.utc(appointment.time_slot.end).format("HH:mm")}.
                    Presso hub ${appointment.hub}
                </p>
            </div>

            <div class="m-2 border rounded p-2 px-3">
                <div aria-hidden="true">
                    <div class="d-flex justify-content-between">
                        <div>
                            <p class="m-0 fs-5 fw-semibold">${moment.utc(appointment.time_slot.start).format("HH:mm")} - ${moment.utc(appointment.time_slot.end).format("HH:mm")}</p>
                            <p class="m-0 fs-6 fw-semibold">${moment.utc(appointment.time_slot.start).format("DD/MM/YYYY")}</p>
                        </div>
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
                        <span class="m-0 text-truncate">${customer.name} ${customer.surname} ${vip_logo}</span>
                    </div>
                </div>

                <div class="d-flex justify-content-end mt-2">
                    <button class="btn btn-outline-danger btn-sm mx-1" id="button-start-delete-${appointment.id}">Cancella</button>
                    <button class="btn btn-outline-danger btn-sm mx-1" id="button-delete-${appointment.id}" style="display: none">Conferma cancellazione</button>
                    <button class="btn btn-outline-secondary btn-sm mx-1" id="button-abort-${appointment.id}" style="display: none">Annulla</button>
                </div>
            </div>
        </div>
    `);

    $(`#button-start-delete-${appointment.id}`).on("click", async () => {
        $(`#button-start-delete-${appointment.id}`).hide();
        $(`#button-delete-${appointment.id}`).show();
        $(`#button-abort-${appointment.id}`).show();

        $(`button-delete-${appointment.id}`).trigger("focus");
    });

    $(`#button-delete-${appointment.id}`).on("click", async () => {
        await AppointmentAPI.deleteAppointmentsById(appointment.id);
        $(`#container-${appointment.id}`).remove();
    });

    $(`#button-abort-${appointment.id}`).on("click", async () => {
        $(`#button-start-delete-${appointment.id}`).show();
        $(`#button-delete-${appointment.id}`).hide();
        $(`#button-abort-${appointment.id}`).hide();
    });
}