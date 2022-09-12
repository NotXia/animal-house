export function showError(field, message) {
    $(`#data-${field}-feedback`).html(message);
    $(`#data-${field}-feedback`).show();
}

export function showErrors(errors) {
    clearErrors();
    for (const error of errors) {
        showError(error.field, error.message);
    }
}

export function clearError(field) {
    $(`#data-${field}-feedback`).html("");
    $(`#data-${field}-feedback`).hide();
}

export function clearErrors() {
    for (const error of $(`div[id*="-feedback"]`)) {
        $(error).html("");
        $(error).hide();
    }
}
