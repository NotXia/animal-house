import {base64} from "/js/utilities.js";

export async function getCategoryData() {
    return {
        name: $("#data-name").val(),
        icon: $("#data-icon").prop('files')[0] ? await base64($("#data-icon").prop('files')[0]) : undefined
    }
}

export function reset() {
    $("#icon-preview").hide();
    $("#form-category").trigger("reset");

    // Reset bottoni
    $("#form-category-submit-container > div").hide();
    $("#form-category-submit-container > button").attr("type", "button");
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