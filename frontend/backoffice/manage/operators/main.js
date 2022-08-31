const WEEKS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const TRANSLATE = { "monday": "Lunedì", "tuesday": "Martedì", "wednesday": "Mercoledì", "thursday": "Giovedì", "friday": "Venerdì", "saturday": "Sabato", "sunday": "Domenica" };
let operator_cache = {};

$(document).ready(async function() {
    $('#picture-upload').on("change", function (e) { 
        let reader = new FileReader();
        reader.onload = function (e) { $("#data-picture").attr('src', e.target.result); }
        reader.readAsDataURL(this.files[0]);
    });

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
            console.log(err);
        }
        hideLoading();
    });

    $("#modify-btn").on("click", function (e) {
        modifyMode();
    });

    $("#revert-btn").on("click", function (e) {
        resetForm();
        loadOperatorData(operator_cache);
        viewMode();
    });

    $("#save-btn").on("click", async function (e) {
        try {
            showLoading();
            
            const operator_data = await api_request({ 
                    type: "PUT", url: `/users/operators/${operator_cache.username}`,
                    processData: false, contentType: "application/json",
                    data: JSON.stringify(await getFormOperatorData())
            });
            operator_cache = operator_data;

            $("#navbar-placeholder").load("/admin/navbar.html");
            viewMode();
        }
        catch (err) {
            if (err.status === 400) {
                showErrors(err.responseJSON);
            }
        }
        hideLoading();
    });

    $("#delete-btn").on("click", async function (e) {
        try {
            showLoading();
            
            await api_request({
                type: "DELETE", url: `/users/operators/${operator_cache.username}`
            });

        } catch (err) {
            console.log(err);
        }
        
        hideLoading();
        resetForm();
    });

    $("#start_create-btn").on("click", function (e) {
        resetForm();
        creationMode();
    });

    $("#create-btn").on("click", async function (e) {
        if (!document.getElementById("operator-form").reportValidity()) { return; }
        
        try {
            showLoading();

            let operator_data = await getFormOperatorData();
            operator_data.username = $("#data-username").val();
            
            const operator = await api_request({ 
                type: "POST", url: `/users/operators/`,
                processData: false, contentType: "application/json",
                data: JSON.stringify(operator_data)
            });
            operator_cache = operator;

            viewMode();
        } catch (err) {
            if (err.status === 400) {
                showErrors(err.responseJSON);
            }
        }
        
        hideLoading();
    });
});

function startMode() {
    $("#operator-form").hide();
    $("#enable_modify-container").hide();
    $("#modify-container").hide();
    $("#create-container").hide();
    disableForm();
    clearErrors();
    resetButtons();
}

function creationMode() {
    $("#operator-form").show();
    $("#enable_modify-container").hide();
    $("#modify-container").hide();
    $("#create-container").show();
    enableForm();
    clearErrors();
    resetButtons();
    $("#create-btn").attr("type", "submit");
    $("#data-enabled").prop("checked", true);
    $("#data-enabled").prop("disabled", true);
    $("#data-password").attr("required", true);
}

function viewMode() {
    $("#operator-form").show();
    $("#enable_modify-container").show();
    $("#modify-container").hide();
    $("#create-container").hide();
    disableForm();
    clearErrors();
    resetButtons();
}

function modifyMode() {
    $("#operator-form").show();
    $("#enable_modify-container").hide();
    $("#modify-container").show();
    $("#create-container").hide();
    enableForm();
    clearErrors();
    resetButtons();
    $("#data-username").prop("disabled", true);
    $("#save-btn").attr("type", "submit");
    $("#data-password").attr("required", false);
}

function showLoading() {
    $("#loading-container").show();
}

function hideLoading() {
    $("#loading-container").hide();
}

function resetForm() {
    $("#operator-form").trigger("reset");
    emptyTimeSlots();
    $("#data-picture").attr("src", "/profiles/images/default.png");
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

async function uploadProfilePicture() {
    let uploaded_image = undefined;

    if ($("#picture-upload")[0].files.length === 1) {
        let upload_data = new FormData();
        upload_data.append("file0", $("#picture-upload")[0].files[0]);

        try {
            let upload_res = await api_request({
                method: "POST",
                url: "/files/images/",
                data: upload_data,
                cache: false, contentType: false, processData: false
            });

            uploaded_image = upload_res[0];
            $("#picture-upload").val("");
        }
        catch (err) {
            console.log(err);
        }
    }

    return uploaded_image;
}

async function getFormOperatorData() {
    let form_data = {
        password: $("#data-password").val().length === 0 ? undefined : $("#data-password").val(),
        email: $("#data-email").val(),
        name: $("#data-name").val(),
        surname: $("#data-surname").val(),
        gender: $("input:radio[name=data-gender]:checked").val(),
        phone: $("#data-phone").val(),
        role: $("#data-role").val(),
        services_id: $.map($("input:checkbox[name=data-services]:checked"), (checked, _) => checked.value),
        enabled: $("#data-enabled").is(":checked"),
        permissions: $.map($("input:checkbox[name=data-permissions]:checked"), (checked, _) => checked.value),
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
        let input_time_start = $(`input[name=data-working_time-${day}-time-start]`);
        let input_time_end = $(`input[name=data-working_time-${day}-time-end]`);
        let input_hub = $(`input:text[name=data-working_time-${day}-hub]`);

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

/* Carica i dati di un operatore */
function loadOperatorData(data) {
    $("#data-picture").attr("src", data.picture);
    $("#data-username").val(he.decode(data.username));
    $("#data-email").val(data.email);
    $("#data-name").val(he.decode(data.name));
    $("#data-surname").val(he.decode(data.surname));
    $("#data-phone").val(data.phone);
    $("#data-role").val(he.decode(data.role));
    $("input:radio[name=data-gender]").filter(`[value=${data.gender}]`).prop("checked", true);
    $("input:checkbox[name=data-enabled]").prop("checked", data.enabled);
    for (const permission of data.permissions) { $("input:checkbox[name=data-permissions]").filter(`[value=${permission}]`).prop("checked", true); }
    for (const service_id of data.services_id) { $("input:checkbox[name=data-services]").filter(`[value=${service_id}]`).prop("checked", true); }

    emptyTimeSlots();
    for (const day of WEEKS) {
        for (const working_slot of data.working_time[day]) {
            addTimeSlotTo(day, working_slot.time.start, working_slot.time.end, working_slot.hub);
        }
    }
}

let time_slot_index = 0; // Per differenziare i vari slot
/* Crea un nuovo slot lavorativo per un giorno della settimana */
function addTimeSlotTo(day_of_week, start_time, end_time, hub_code) {
    const index = time_slot_index;
    time_slot_index++;

    $(`#${day_of_week}-accordion-container`).append(`
        <div class="row mb-1" id="working_time-${day_of_week}-${index}">
            <div class="col-7 col-lg-5 offset-lg-1">
                <div class="d-flex justify-content-center">
                    <div class="w-50">
                        <label for="data-${day_of_week}-${index}-time-start">Inizio</label>
                        <input type="time" class="form-control" name="data-working_time-${day_of_week}-time-start" id="data-${day_of_week}-${index}-time-start" value="${start_time ? moment(start_time).format("HH:mm") : ""}">
                    </div>
                    <div class="w-50">
                        <label for="data-${day_of_week}-${index}-time-end">Fine</label>
                        <input type="time" class="form-control" name="data-working_time-${day_of_week}-time-end" id="data-${day_of_week}-${index}-time-end" value="${end_time ? moment(end_time).format("HH:mm") : ""}">
                    </div>
                </div>
            </div>
            <div class="col-4 col-lg-4">
                <div>
                    <label for="data-${day_of_week}-${index}-hub">Hub</label>
                    <input type="text" class="form-control" name="data-working_time-${day_of_week}-hub" id="data-${day_of_week}-${index}-hub" value="${hub_code}">
                </div>
            </div>
            <div class="col-1">
                <div class="d-flex justify-content-center align-items-center h-100">
                    <button type="button" class="btn-close" aria-label="Cancella riga" id="working_time-${day_of_week}-${index}-delete" name="working_time-delete"></button>
                </div>
            </div>
        </div>
        <div class="row mb-3">
            <div class="col-12">
                <div id="data-${day_of_week}-${index}-feedback" class="invalid-feedback text-center"></div>
            </div>
        </div>
    `);

    // Verifica che l'intervallo sia valido ad ogni modifica
    $(`#data-${day_of_week}-${index}-time-start, #data-${day_of_week}-${index}-time-end`).on("change", function (e) { 
        const start_time = $(`#data-${day_of_week}-${index}-time-start`).val();
        const end_time = $(`#data-${day_of_week}-${index}-time-end`).val();
        
        if (start_time !== "" && end_time !== "") {
            if ( moment(start_time, "HH:mm").isSameOrAfter(moment(end_time, "HH:mm")) ) {
                showError(`${day_of_week}-${index}`, "Intervallo di tempo non valido");
            }
            else {
                clearError(`${day_of_week}-${index}`);
            }
        }
    });

    $(`#working_time-${day_of_week}-${index}-delete`).on("click", function (e) { 
        $(`#working_time-${day_of_week}-${index}`).remove(); 
    });
}

/* Svuota il form degli slot lavorativi */
function emptyTimeSlots() {
    time_slot_index = 0;

    for (const day of WEEKS) {
        $(`#${day}-accordion-container`).html("");
    }
}

// Memorizza il selettore per tutti gli input nel form
let all_inputs = [
    "#data-username", "#data-password", "#data-email", "#data-name", "#data-surname", "#data-phone", "#data-role", "#picture-upload",
    "input:radio[name=data-gender]", "input:checkbox[name=data-enabled]", "input:checkbox[name=data-permissions]", "input:checkbox[name=data-services]",
    "button[name=working_time-delete]"
];
for (const day of WEEKS) { 
    all_inputs = all_inputs.concat([
        `input[name=data-working_time-${day}-time-start]`, `input[name=data-working_time-${day}-time-end]`, `input:text[name=data-working_time-${day}-hub]`,
        `#${day}-add_slot`
    ]);
}
function disableForm() {
    for (const selector of all_inputs) { $(selector).prop("disabled", true); }
}
function enableForm() {
    for (const selector of all_inputs) { $(selector).prop("disabled", false); }
}