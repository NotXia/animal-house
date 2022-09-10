function setReadOnly(selector) {
    $(selector).on("click.readonly", function() { return false; });
    $(selector).attr("aria-readonly", true);
}

function removeReadOnly(selector) {
    $(selector).off("click.readonly");
    $(selector).attr("aria-readonly", false);
}