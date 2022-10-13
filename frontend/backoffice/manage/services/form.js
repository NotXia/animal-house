export function getServiceData() {
    return {
        name: $("#data-name").val(),
        description: $("#data-description").val(),
        duration: $("#data-duration").val(),
        price: $("#data-price").val(),
        online: $("#data-online").is(":checked"),
        target: $.map($("input:checkbox[name=target]:checked"), (checked, _) => checked.value)
    }
}