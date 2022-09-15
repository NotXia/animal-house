import {Error} from "/admin/import/Error.js";
import * as OpeningTime from "./view/openingTime.js";
import {WEEKS} from "/js/utilities.js";


/**
 * Estrae i dati dell'hub inseriti nel form
 * @returns Dati dell'hub
 */
export function getHubData() {
    let hub_data = {
        code: $("#data-code").val(),
        name: $("#data-name").val(),
        phone: $("#data-phone").val() === "" ? undefined : $("#data-phone").val(),
        email: $("#data-email").val() === "" ? undefined : $("#data-email").val(),
        address: {
            city: $("#data-address-city").val(),
            street: $("#data-address-street").val(),
            number: $("#data-address-number").val(),
            postal_code: $("#data-address-postalcode").val()
        },
        opening_time: {}
    };

    for (const day of WEEKS) {
        let opening_slots = []
        let input_time_start = $(`#${day}-accordion-container > * input[name*=-time-start]`);
        let input_time_end = $(`#${day}-accordion-container > * input[name*=-time-end]`);

        for (let i=0; i<input_time_start.length; i++) {
            opening_slots.push({
                start: moment(input_time_start[i].value, "HH:mm").format(),
                end: moment(input_time_end[i].value, "HH:mm").format(),
            });
        }
        hub_data.opening_time[day] = opening_slots;
    }

    return hub_data;
}

/**
 * Visualizza i dati dell'hub nel form
 */
export function loadHubData(hub) {
    $("#data-code").val(hub.code);
    $("#data-name").val(hub.name);
    $("#data-phone").val(hub.phone);
    $("#data-email").val(hub.email);
    fillAddress(hub.address);
    for (const day of WEEKS) {
        for (const slot of hub.opening_time[day]) {
            OpeningTime.addTimeSlotTo(day, slot.start, slot.end);
        }
    }
}

export function fillAddress(address) {
    $("#data-address-city").val(address.city);
    $("#data-address-street").val(address.street);
    $("#data-address-number").val(address.number);
    $("#data-address-postalcode").val(address.postal_code);
}

export function disableForm() {
    $("#hub-form input[type='text']").attr("readonly", true);
    $("#hub-form input[type='time']").attr("readonly", true);
    $("#hub-form button[id*='data-opening_time']").prop("disabled", true);
}

export function enableForm() {
    $("#hub-form input[type='text']").attr("readonly", false);
    $("#hub-form input[type='time']").attr("readonly", false);
    $("#hub-form button[id*='data-opening_time']").prop("disabled", false);
}

export function disableAddressInput() {
    $("#data-address-city").prop("disabled", true);
    $("#data-address-street").prop("disabled", true);
    $("#data-address-number").prop("disabled", true);
    $("#data-address-postalcode").prop("disabled", true);
}

export function enableAddressInput() {
    $("#data-address-city").prop("disabled", false);
    $("#data-address-street").prop("disabled", false);
    $("#data-address-number").prop("disabled", false);
    $("#data-address-postalcode").prop("disabled", false);
}

export function clearFormData() {
    $("#hub-form").trigger("reset");
    OpeningTime.emptyTimeSlots();
    Error.clearErrors();
}

export function show() {
    $("#hub-form").show();
}
export function hide() {
    $("#hub-form").hide();
}


function _resetSubmitButtons() {
    $("#form-submits-container > div").hide();
    $("#form-submits-container button").attr("type", "button");
}

export function createMode() {
    show();
    _resetSubmitButtons();
    $("#create-button-container").show();
    $("#create-button").attr("type", "submit");
    enableForm();
}

export function viewMode() {
    show();
    _resetSubmitButtons();
    $("#enable-modify-button-container").show();
    disableForm();
}

export function modifyMode() {
    show();
    _resetSubmitButtons();
    $("#modify-button-container").show();
    $("#modify-button").attr("type", "submit");
    enableForm();

    $("#data-code").attr("readonly", true);
}