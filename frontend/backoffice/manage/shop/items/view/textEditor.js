/* Inizializzazione text editor */
export async function init(container_selector) {
    return ClassicEditor.create(document.querySelector(container_selector), {
        language: "it",
        toolbar: [ "Heading", "|", "bold", "italic", "|", "bulletedList", "numberedList", "outdent", "indent", "numberedList", "|", "link", "blockQuote", "insertTable", "|", "undo", "redo" ]
    });
}