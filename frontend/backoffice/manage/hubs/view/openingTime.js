import {WEEKS, TRANSLATE} from "/js/utilities.js";

/* Crea il form per l'orario di apertura */
export function createOpeningTimeForm() {
    for (const day of WEEKS) {
        $("#opening_time-accordion").append(`
            <div class="accordion-item">
                <h3 class="accordion-header" id="${day}-heading">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${day}-collapse" aria-expanded="false" aria-controls="${day}-collapse">
                        ${TRANSLATE[day]}
                    </button>
                </h3>
                <div id="${day}-collapse" class="accordion-collapse collapse" aria-labelledby="${day}-heading" data-bs-parent="#opening_time-accordion">
                    <div class="accordion-body">
                        <div id="${day}-accordion-container" class="container"></div>
                        <div class="d-flex justify-content-center mb-2">
                            <button type="button" class="btn btn-outline-success" id="data-opening_time-${day}-add_slot" aria-label="Aggiungi slot lavorativo per ${TRANSLATE[day]}"><span class="button-icon">+</span></button>
                        </div>
                    </div>
                </div>
            </div>
        `);

        $(`#data-opening_time-${day}-add_slot`).on("click", function (e) {
            addTimeSlotTo(day, "", "", "", focus=true);
        });
    }
}

let time_slot_index = 0; // Per differenziare i vari slot
/* Crea un nuovo slot lavorativo per un giorno della settimana */
export function addTimeSlotTo(day_of_week, start_time, end_time, focus=false) {
    const index = time_slot_index;
    time_slot_index++;

    $(`#${day_of_week}-accordion-container`).append(`
        <div id="opening_time-${day_of_week}-${index}">
            <div class="row mb-1">
                <div class="col-11 col-lg-8 offset-lg-2">
                    <div class="d-flex justify-content-center">
                        <div class="w-50">
                            <label for="data-${day_of_week}-${index}-time-start">Inizio</label>
                            <input type="time" class="form-control" name="opening_time-${day_of_week}-${index}-time-start" id="data-${day_of_week}-${index}-time-start" value="${start_time ? moment(start_time).format("HH:mm") : ""}">
                        </div>
                        <div class="w-50">
                            <label for="data-${day_of_week}-${index}-time-end">Fine</label>
                            <input type="time" class="form-control" name="opening_time-${day_of_week}-${index}-time-end" id="data-${day_of_week}-${index}-time-end" value="${end_time ? moment(end_time).format("HH:mm") : ""}">
                        </div>
                    </div>
                </div>
                <div class="col-1">
                    <div class="d-flex justify-content-center align-items-center h-100">
                        <button type="button" class="btn-close" aria-label="Cancella riga" id="data-opening_time-${day_of_week}-${index}-delete" name="opening_time-delete"></button>
                    </div>
                </div>
            </div>
            <div class="row mb-3">
                <div class="col-12">
                    <label for="data-${day_of_week}-${index}-time-start" data-feedback-for="opening_time-${day_of_week}-${index}-time-start" class="invalid-feedback d-block text-center" aria-live="polite"></label>
                    <label for="data-${day_of_week}-${index}-time-end" data-feedback-for="opening_time-${day_of_week}-${index}-time-end" class="invalid-feedback d-block text-center" aria-live="polite"></label>
                </div>
            </div>
        </div>
    `);

    //Validazione intervalli
    $(`#data-${day_of_week}-${index}-time-start`).rules("add", { 
        beforeTime: `#data-${day_of_week}-${index}-time-end`,
        required: { depends: (_) => $(`#data-${day_of_week}-${index}-time-end`).val() || $(`#data-${day_of_week}-${index}-hub`).val() }
    });
    $(`#data-${day_of_week}-${index}-time-end`).on("change", function () {
        $(`#data-${day_of_week}-${index}-time-start`).valid();
    });

    // Bottone per eliminare la riga
    $(`#data-opening_time-${day_of_week}-${index}-delete`).on("click", function (e) { 
        $(`#opening_time-${day_of_week}-${index}`).remove(); 
    });

    if (focus) { $(`#data-${day_of_week}-${index}-time-start`).focus(); }
}

/* Svuota il form degli slot lavorativi */
export function emptyTimeSlots() {
    for (const day of WEEKS) {
        $(`#${day}-accordion-container`).html("");
    }
}