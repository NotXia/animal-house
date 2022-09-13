import { WEEKS, TRANSLATE } from "/js/utilities.js";

/* Crea il form per l'orario lavorativo */
export function createWorkingTimeForm() {
    for (const day of WEEKS) {
        $("#working_time-accordion").append(`
            <div class="accordion-item">
                <h3 class="accordion-header" id="${day}-heading">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${day}-collapse" aria-expanded="false" aria-controls="${day}-collapse">
                        ${TRANSLATE[day]}
                    </button>
                </h3>
                <div id="${day}-collapse" class="accordion-collapse collapse" aria-labelledby="${day}-heading" data-bs-parent="#working_time-accordion">
                    <div class="accordion-body">
                        <div id="${day}-accordion-container" class="container"></div>
                        <div class="d-flex justify-content-center mb-2">
                            <button type="button" class="btn btn-outline-success" id="data-working_time-${day}-add_slot" aria-label="Aggiungi slot lavorativo per ${TRANSLATE[day]}"><span class="button-icon">+</span></button>
                        </div>
                    </div>
                </div>
            </div>
        `);

        $(`#data-working_time-${day}-add_slot`).on("click", function (e) {
            addTimeSlotTo(day, "", "", "", focus=true);
        });
    }
}

let time_slot_index = 0; // Per differenziare i vari slot
/* Crea un nuovo slot lavorativo per un giorno della settimana */
export function addTimeSlotTo(day_of_week, start_time, end_time, hub_code, focus=false) {
    const index = time_slot_index;
    time_slot_index++;

    $(`#${day_of_week}-accordion-container`).append(`
        <div id="working_time-${day_of_week}-${index}">
            <div class="row mb-1">
                <div class="col-7 col-lg-5 offset-lg-1">
                    <div class="d-flex justify-content-center">
                        <div class="w-50">
                            <label for="data-${day_of_week}-${index}-time-start">Inizio</label>
                            <input type="time" class="form-control" name="working_time-${day_of_week}-${index}-time-start" id="data-${day_of_week}-${index}-time-start" value="${start_time ? moment(start_time).format("HH:mm") : ""}">
                        </div>
                        <div class="w-50">
                            <label for="data-${day_of_week}-${index}-time-end">Fine</label>
                            <input type="time" class="form-control" name="working_time-${day_of_week}-${index}-time-end" id="data-${day_of_week}-${index}-time-end" value="${end_time ? moment(end_time).format("HH:mm") : ""}">
                        </div>
                    </div>
                </div>
                <div class="col-4 col-lg-4">
                    <div>
                        <label for="data-${day_of_week}-${index}-hub">Hub</label>
                        <input type="text" class="form-control" name="working_time-${day_of_week}-${index}-hub" id="data-${day_of_week}-${index}-hub" value="${hub_code}">
                    </div>
                </div>
                <div class="col-1">
                    <div class="d-flex justify-content-center align-items-center h-100">
                        <button type="button" class="btn-close" aria-label="Cancella riga" id="data-working_time-${day_of_week}-${index}-delete" name="working_time-delete"></button>
                    </div>
                </div>
            </div>
            <div class="row mb-3">
                <div class="col-12">
                    <label for="data-${day_of_week}-${index}-time-start" data-feedback-for="working_time-${day_of_week}-${index}-time-start" class="invalid-feedback d-block text-center" aria-live="polite"></label>
                    <label for="data-${day_of_week}-${index}-time-end" data-feedback-for="working_time-${day_of_week}-${index}-time-end" class="invalid-feedback d-block text-center" aria-live="polite"></label>
                    <label for="data-${day_of_week}-${index}-hub" data-feedback-for="working_time-${day_of_week}-${index}-hub" class="invalid-feedback d-block text-center" aria-live="polite"></label>
                </div>
            </div>
        </div>
    `);

    // Validazione intervalli
    $(`#data-${day_of_week}-${index}-time-start`).rules("add", { 
        beforeTime: `#data-${day_of_week}-${index}-time-end`,
        required: { depends: (_) => $(`#data-${day_of_week}-${index}-time-end`).val() || $(`#data-${day_of_week}-${index}-hub`).val() }
    });
    $(`#data-${day_of_week}-${index}-time-end`).on("change", function () {
        $(`#data-${day_of_week}-${index}-time-start`).valid();
    });
    $(`#data-${day_of_week}-${index}-hub`).rules("add", { 
        hubCode: true,
        required: { depends: (_) => $(`#data-${day_of_week}-${index}-time-start`).val() || $(`#data-${day_of_week}-${index}-time-end`).val() }
    });

    // Bottone per eliminare la riga
    $(`#data-working_time-${day_of_week}-${index}-delete`).on("click", function (e) { 
        $(`#working_time-${day_of_week}-${index}`).remove(); 
    });

    if (focus) { $(`#data-${day_of_week}-${index}-time-start`).focus(); }
}

/* Svuota il form degli slot lavorativi */
export function emptyTimeSlots() {
    for (const day of WEEKS) {
        $(`#${day}-accordion-container`).html("");
    }
}