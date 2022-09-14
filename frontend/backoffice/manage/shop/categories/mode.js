export const CREATE = 1,
             MODIFY = 2,
             ERROR = -1;

export let current;

export function create() {
    current = CREATE;
    $("#modal-category-title").text("Crea categoria");
    $("#create-submit-container").show();
    $("#modify-submit-container").hide();
    $("#create-submit-btn").attr("type", "submit");
    $("#modify-submit-btn").attr("type", "button");
}

export function modify() {
    current = MODIFY;
    $("#modal-category-title").text("Modifica categoria");
    $("#modify-submit-container").show();
    $("#create-submit-container").hide();
    $("#modify-submit-btn").attr("type", "submit");
    $("#create-submit-btn").attr("type", "button");
}

export function error(message) {
    current = ERROR;
    $("#global-feedback").html(message);
}