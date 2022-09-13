import * as WorkingTimeHandler from "./view/working_time.js";
import {Error} from "../../import/Error.js";
import { setReadOnly, removeReadOnly } from "/js/utilities.js";
import * as Mode from "./mode.js";
import { FileUpload } from "/admin/import/FileUpload.js";
import { WEEKS } from "/js/utilities.js";

/**
 * Rende il form read only
 */
export function readOnlyForm() {
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

/**
 * Rende il form editabile
 */
export function enableForm() {
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

/**
 * Resetta i bottoni rendendoli non submit
 */
export function resetButtons() {
    for (const button of $("#button-container > * button")) {
        $(button).attr("type", "button");
    }
}

export function resetForm() {
    $("#operator-form").trigger("reset");
    WorkingTimeHandler.emptyTimeSlots();
    $("#profile-picture").attr("src", "/profiles/images/default.png");
    Error.clearErrors();
}


/* Carica l'immagine di profilo sul server */
async function uploadProfilePicture() {
    let uploaded_image = undefined;

    if ($("#data-picture")[0].files.length === 1) {
        let upload_data = new FormData();
        upload_data.append("file0", $("#data-picture")[0].files[0]);

        try {
            uploaded_image = (await FileUpload.upload(upload_data))[0];
            $("#data-picture").val("");
        }
        catch (err) {
            Mode.error(err.responseJSON.message);
        }
    }

    return uploaded_image;
}

export async function getOperatorData() {
    let form_data = {
        username: $("#data-username").val(),
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


/* Carica i dati di un operatore */
export function loadOperatorData(data) {
    resetForm();

    $("#profile-picture").attr("src", data.picture);
    $("#data-username").val(data.username);
    $("#data-email").val(data.email);
    $("#data-name").val(data.name);
    $("#data-surname").val(data.surname);
    $("#data-phone").val(data.phone);
    $("#data-role").val(data.role);
    $("input:radio[name=gender]").filter(`[value=${data.gender}]`).prop("checked", true);
    $("input:checkbox[name=enabled]").prop("checked", data.enabled);
    for (const permission of data.permissions) { $("input:checkbox[name=permissions]").filter(`[value=${permission}]`).prop("checked", true); }
    for (const service_id of data.services_id) { $("input:checkbox[name=services]").filter(`[value=${service_id}]`).prop("checked", true); }

    WorkingTimeHandler.emptyTimeSlots();
    for (const day of WEEKS) {
        for (const working_slot of data.working_time[day]) {
            WorkingTimeHandler.addTimeSlotTo(day, working_slot.time.start, working_slot.time.end, working_slot.hub);
        }
    }
}