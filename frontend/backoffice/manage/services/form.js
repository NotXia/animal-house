export function getServiceData() {
    return {
        name: $("#data-name").val(),
        description: $("#data-description").val(),
        duration: $("#data-duration").val(),
        price: $("#data-price").val()*100,
        online: $("#data-online").is(":checked"),
        target: $.map($("input:checkbox[name=target]:checked"), (checked, _) => checked.value)
    }
}

export function reset() {
    $("#form-service").trigger("reset");

    // Reset bottoni
    $("#form-service-submit-container > div").hide();
    $("#form-service-submit-container > button").attr("type", "button");
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