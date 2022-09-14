import {base64} from "/js/utilities.js";

export async function getCategoryData() {
    return {
        name: $("#data-name").val(),
        icon: $("#data-icon").prop('files')[0] ? await base64($("#data-icon").prop('files')[0]) : undefined
    }
}