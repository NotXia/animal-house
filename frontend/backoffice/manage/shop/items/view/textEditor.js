/* Inizializzazione text editor */
export async function init(container_selector) {
    let editor = await ClassicEditor.create(document.querySelector(container_selector), {
        language: "it",
        toolbar: [ "Heading", "|", "bold", "italic", "|", "bulletedList", "numberedList", "outdent", "indent", "numberedList", "|", "link", "blockQuote", "insertTable", "|", "undo", "redo" ]
    });

    editor.on("change:isReadOnly", ( _, __, isReadOnly ) => { editor.ui.view.toolbar.element.style.display = isReadOnly ? "none" : "flex"; });

    return editor;
}