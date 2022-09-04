const WEEKS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const TRANSLATE = { "monday": "Lunedì", "tuesday": "Martedì", "wednesday": "Mercoledì", "thursday": "Giovedì", "friday": "Venerdì", "saturday": "Sabato", "sunday": "Domenica" };
let operator_cache = {};
let curr_mode = "";

$(document).ready(async function() {
    $("#operator-form").validate({
        rules: {
            username: {
                required: true
            },
            password: {
                required: { depends: (_) => (curr_mode == "creation") },
                securePassword: true
            },
            email: {
                required: true, 
                email: true
            },
            name: {
                required: true
            },
            surname: {
                required: true
            },
            gender: {
                required: true
            },
            phone: {
                required: true,
                phoneNumber: true
            },
            role: {
                required: true
            },
        },
        errorPlacement: function(error, element) {
            showError(element.attr("name"), error);
        },
        submitHandler: async function(form, event) {
            event.preventDefault();

            showLoading();

            try {
                let operator_data = await getFormOperatorData();
                let res_operator;

                // Aggiornamento o creazione
                switch (curr_mode) {
                    case "modify":
                        res_operator = await api_request({ 
                            type: "PUT", url: `/users/operators/${operator_cache.username}`,
                            processData: false, contentType: "application/json",
                            data: JSON.stringify(operator_data)
                        });

                        // Aggiornamento della navbar se si aggiorna sé stessi
                        if (operator_cache.username === await getUsername()) { $("#navbar-placeholder").load("/admin/navbar.html"); }
                        break;

                    case "creation":
                        operator_data.username = $("#data-username").val();

                        res_operator = await api_request({ 
                            type: "POST", url: `/users/operators/`,
                            processData: false, contentType: "application/json",
                            data: JSON.stringify(operator_data)
                        });
                        break;
                }

                operator_cache = res_operator;
                loadOperatorData(res_operator);
                viewMode();
            }
            catch (err) {
                if (err.status === 400) {
                    showErrors(err.responseJSON);
                }
                else {
                    errorMode(err.responseJSON.message);
                }
            }

            hideLoading();
        }
    });

    /* Ricerca di un operatore */
    $("#search_user_form").submit(async function(e) {
        e.preventDefault();
        $("#operator-form").show(); 

        try {
            showLoading();

            const operator_data = await api_request({ type: "GET", url: `/users/operators/${this.username.value}` });
            operator_cache = operator_data;
            
            resetForm();
            loadOperatorData(operator_data);
            viewMode();
        }
        catch (err) {
            errorMode(err.responseJSON ? err.responseJSON.message : "Utente inesistente");
        }
        hideLoading();
    });

    /* Anteprima immagine di profilo caricata */
    $("#data-picture").on("change", function (e) { 
        let reader = new FileReader();
        reader.onload = function (e) { $("#profile-picture").attr('src', e.target.result); }
        reader.readAsDataURL(this.files[0]);
    });

    /* Passaggio alla modalità creazione di un operatore */
    $("#start_create-btn").on("click", function (e) {
        resetForm();
        creationMode();
    });

    /* Passaggio alla modalità modifica di un operatore */
    $("#modify-btn").on("click", function (e) {
        modifyMode();
    });

    /* Annulla le modifiche */
    $("#revert-btn").on("click", function (e) {
        resetForm();
        loadOperatorData(operator_cache);
        viewMode();
    });

    /* Cancellazione di un operatore */
    $("#delete-btn").on("click", async function (e) {
        showLoading();

        try {
            await api_request({
                type: "DELETE", url: `/users/operators/${operator_cache.username}`
            });
        } catch (err) {
            errorMode(err.responseJSON.message);
        }
        
        hideLoading();
        resetForm();
        startMode();
    });
});


/*
    Operazioni sulle modalità
*/

function startMode() {
    curr_mode = "start";
    $("#operator-form").hide();
    $("#enable_modify-container").hide();
    $("#modify-container").hide();
    $("#create-container").hide();
    readOnlyForm();
    clearErrors();
    resetButtons();
}

function creationMode() {
    curr_mode = "creation";
    $("#operator-form").show();
    $("#enable_modify-container").hide();
    $("#modify-container").hide();
    $("#create-container").show();
    enableForm();
    clearErrors();
    resetButtons();
    $("#create-btn").attr("type", "submit");
    $("#data-enabled").prop("checked", true);
    setReadOnly("#data-enabled");
    $("#data-username").focus();
}

function viewMode() {
    curr_mode = "view";
    $("#operator-form").show();
    $("#enable_modify-container").show();
    $("#modify-container").hide();
    $("#create-container").hide();
    readOnlyForm();
    clearErrors();
    resetButtons();
    $("#data-username").focus();
}

function modifyMode() {
    curr_mode = "modify";
    $("#operator-form").show();
    $("#enable_modify-container").hide();
    $("#modify-container").show();
    $("#create-container").hide();
    enableForm();
    clearErrors();
    resetButtons();
    $("#data-username").prop("readonly", true);
    $("#data-username").attr("aria-readonly", true);
    $("#save-btn").attr("type", "submit");
    $("#data-username").focus();
}

function errorMode(message) {
    curr_mode = "error";
    startMode();
    $("#global-feedback").html(message);
}


/*
    Operazioni sulla barra caricamento
*/

function showLoading() {
    $("#loading-container").show();
}

function hideLoading() {
    $("#loading-container").hide();
}

/* Carica un'immagine sul server */
async function uploadProfilePicture() {
    let uploaded_image = undefined;

    if ($("#data-picture")[0].files.length === 1) {
        let upload_data = new FormData();
        upload_data.append("file0", $("#data-picture")[0].files[0]);

        try {
            let upload_res = await api_request({
                method: "POST",
                url: "/files/images/",
                data: upload_data,
                cache: false, contentType: false, processData: false
            });

            uploaded_image = upload_res[0];
            $("#data-picture").val("");
        }
        catch (err) {
            errorMode(err.responseJSON.message);
        }
    }

    return uploaded_image;
}


/*
    Estrazione dei dati dal form
*/

async function getFormOperatorData() {
    let form_data = {
        password: $("#data-password").val().length === 0 ? undefined : $("#data-password").val(),
        email: $("#data-email").val(),
        name: $("#data-name").val(),
        surname: $("#data-surname").val(),
        gender: $("input:radio[name=gender]:checked").val(),
        phone: $("#data-phone").val(),
        role: $("#data-role").val(),
        services_id: $.map($("input:checkbox[name=services]:checked"), (checked, _) => checked.value),
        enabled: $("#data-enabled").is(":checked"),
        permissions: $.map($("input:checkbox[name=permissions]:checked"), (checked, _) => checked.value),
        picture: await uploadProfilePicture(),
        working_time: getFormOperatorWorkingTime()
    };

    Object.keys(form_data).forEach((key) => { if (form_data[key] === undefined) delete form_data[key] }); // Rimuove le chiavi associate a valori undefined

    return form_data;
}

function getFormOperatorWorkingTime() {
    let form_working_time = {};

    for (const day of WEEKS) {
        let working_slots = []
        let input_time_start = $(`#${day}-accordion-container > * input[name*=-time-start]`);
        let input_time_end = $(`#${day}-accordion-container > * input[name*=-time-end]`);
        let input_hub = $(`#${day}-accordion-container > * input[name*=-hub]`);

        for (let i=0; i<input_hub.length; i++) {
            working_slots.push({
                time: {
                    start: moment(input_time_start[i].value, "HH:mm").format(),
                    end: moment(input_time_end[i].value, "HH:mm").format(),
                },
                hub: input_hub[i].value
            });
        }

        form_working_time[day] = working_slots;
    }

    return form_working_time;
}


/*
    Operazioni sul form
*/

/* Carica i dati di un operatore */
function loadOperatorData(data) {
    $("#profile-picture").attr("src", data.picture);
    $("#data-username").val(he.decode(data.username));
    $("#data-email").val(data.email);
    $("#data-name").val(he.decode(data.name));
    $("#data-surname").val(he.decode(data.surname));
    $("#data-phone").val(data.phone);
    $("#data-role").val(he.decode(data.role));
    $("input:radio[name=gender]").filter(`[value=${data.gender}]`).prop("checked", true);
    $("input:checkbox[name=enabled]").prop("checked", data.enabled);
    for (const permission of data.permissions) { $("input:checkbox[name=permissions]").filter(`[value=${permission}]`).prop("checked", true); }
    for (const service_id of data.services_id) { $("input:checkbox[name=services]").filter(`[value=${service_id}]`).prop("checked", true); }

    emptyTimeSlots();
    for (const day of WEEKS) {
        for (const working_slot of data.working_time[day]) {
            addTimeSlotTo(day, working_slot.time.start, working_slot.time.end, working_slot.hub);
        }
    }
}

function resetForm() {
    $("#operator-form").trigger("reset");
    emptyTimeSlots();
    $("#profile-picture").attr("src", "/profiles/images/default.png");
    clearErrors();
}

function resetButtons() {
    for (const button of $("#button-container > * button")) {
        $(button).attr("type", "button");
    }
}

function showError(field, message) {
    $(`#data-${field}-feedback`).html(message);
    $(`#data-${field}-feedback`).show();
}

function showErrors(errors) {
    clearErrors();
    for (const error of errors) {
        showError(error.field, error.message);
    }
}

function clearError(field) {
    $(`#data-${field}-feedback`).html("");
    $(`#data-${field}-feedback`).hide();
}

function clearErrors() {
    for (const error of $(`div[id*="-feedback"]`)) {
        $(error).html("");
        $(error).hide();
    }
}

let time_slot_index = 0; // Per differenziare i vari slot
/* Crea un nuovo slot lavorativo per un giorno della settimana */
function addTimeSlotTo(day_of_week, start_time, end_time, hub_code, focus=false) {
    const index = time_slot_index;
    time_slot_index++;

    $(`#${day_of_week}-accordion-container`).append(`
        <div class="row mb-1" id="working_time-${day_of_week}-${index}">
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
                <div id="data-working_time-${day_of_week}-${index}-time-start-feedback" class="invalid-feedback d-block text-center" aria-live="polite"></div>
                <div id="data-working_time-${day_of_week}-${index}-time-end-feedback" class="invalid-feedback d-block text-center" aria-live="polite"></div>
                <div id="data-working_time-${day_of_week}-${index}-hub-feedback" class="invalid-feedback d-block text-center" aria-live="polite"></div>
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
function emptyTimeSlots() {
    // time_slot_index = 0;

    for (const day of WEEKS) {
        $(`#${day}-accordion-container`).html("");
    }
}


function readOnlyForm() {
    for (const selector of $("[id^=data-]")) { 
        $(selector).prop("readonly", true); 
        $(selector).attr("aria-readonly", true);
    }
    $("#data-picture").prop("disabled", true);
    $("#data-password").prop("disabled", true);
    setReadOnly("#operator-form > * input:radio, #operator-form > * input:checkbox");
    
    // Bottoni slot orari
    $("button[name=working_time-delete]").prop("disabled", true);
    $("button[id^=data-working_time]").prop("disabled", true);
    
    // Disattiva i radio selezione genere (tranne quello selezionato)
    $("input[id^=data-gender]:not(:checked)").prop("disabled", true)
    $("input[id^=data-gender]:checked").prop("disabled", false)
}

function enableForm() {
    for (const selector of $("[id^=data-]")) { 
        $(selector).prop("readonly", false); 
        $(selector).attr("aria-readonly", false);
    }
    $("#data-picture").prop("disabled", false);
    $("#data-password").prop("disabled", false);
    removeReadOnly("#operator-form > * input:radio, #operator-form > * input:checkbox");

    // Bottoni slot orari
    $("button[name=working_time-delete]").prop("disabled", false);
    $("button[id^=data-]").prop("disabled", false);

    // Radio selezione genere
    $("input[id^=data-gender]").prop("disabled", false)
}