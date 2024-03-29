import {base64} from "/js/utilities.js";

export async function getSpeciesData() {
    return {
        name: $("#data-name").val(),
        logo: $("#data-logo").prop('files')[0] ? await base64($("#data-logo").prop('files')[0]) : undefined
    }
}

export function reset() {
    $("#logo-preview").hide();
    $("#form-species").trigger("reset");

    // Reset bottoni
    $("#form-species-submit-container > div").hide();
    $("#form-species-submit-container > button").attr("type", "button");
}

export function modifyMode() {
    reset();
    $("#modify-submit-container").show();
    $("#modify-submit-btn").attr("type", "submit");
}

export function createMode() {
    reset();
    $("#create-submit-container").show();
    $("#create-submit-btn").attr("type", "submit");
}