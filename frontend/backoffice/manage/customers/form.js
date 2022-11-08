import {Error} from "../../import/Error.js";
import { setReadOnly, removeReadOnly } from "/js/utilities.js";
import * as Mode from "./mode.js";
import { FileUpload } from "/admin/import/FileUpload.js";
import { WEEKS } from "/js/utilities.js";

/**
 * Rende il form read-only
 */
export function readOnlyForm() {
    for (const selector of $("[id^=data-]")) {
        $(selector).prop("readonly", true);
        $(selector).attr("aria-readonly", true);
    }
    $("#data-picture").prop("disabled", true);
    $("#data-password").prop("disabled", true);
    setReadOnly("#customer-form > * input:radio, #customer-form > * input:checkbox");

    // Disattiva i radio selezione genere (tranne quello selezionato)
    $("input[id^=data-gender]:not(:checked)").prop("disabled", true);
    $("input[id^=data-gender]:checked").prop("disabled", false);
}

/**
 * Resetta i bottoni rendendoli non submit
 */
 export function resetButtons() {
    for (const button of $("#button-container > * button")) {
        $(button).attr("type", "button");
    }
}

/**
 * Svuota tutti i campi del form
 */
export function resetForm() {
    $("#customer-form").trigger("reset");
    $("#profile-picture").attr("src", "/profiles/images/default.png");
    Error.clearErrors();
}

/**
 * Gestisce l'upload dell'immagine di profilo
 * @returns Nome dell'immagine caricata
 */
async function uploadProfilePicture() {
    let uploaded_image = undefined;

    if($("#data-picture")[0].files.length === 1) {
        // Preparazione del payload della richiesta
        let upload_data = new FormData();
        upload_data.append("file0", $("#data-picture")[0].files[0]);

        try {
            uploaded_image = (await FileUpload.upload(upload_data))[0];
            $("#data-picture").val("");
        } catch (err) {
            Mode.error(err.responseJSON.message);
        }
    }
}

/**
 * Aggrega i dati del form
 * @returns Dati del form
 */
export async function getCustomerData() {
    let form_data = {
        username: $("#data-username").val(),
        password: $("#data-password").val().length === 0 ? undefined : $("#data-password").val(),
        email: $("#data-email").val(),
        name: $("#data-name").val(),
        surname: $("#data-surname").val(),
        address: $("#data-address").val(),
        phone: $("#data-phone").val(),
        enabled: $("#data-enabled").is(":checked"),
        gender: $("input:radio[name=gender]:checked").val(),
        picture: await uploadProfilePicture(),
    };

    return form_data;
}

/**
 * Carica i dati di un cliente nel form
 */
export function loadCustomerData(data) {
    resetForm();

    $("#profile-picture").attr("src", data.picture);
    $("#data-username").val(data.username);
    $("#data-email").val(data.email);
    $("#data-name").val(data.name);
    $("#data-surname").val(data.surname);
    $("#data-address").val(data.address);
    $("#data-phone").val(data.phone);
    $("input:radio[name=gender]").filter(`[value=${data.gender}]`).prop("checked", true);
    $("input:checkbox[name=enabled]").prop("checked", data.enabled);

}