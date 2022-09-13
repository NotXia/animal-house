/**
 * Gestore dei messaggi di errore.
 * I contenitori dei messaggi di errore devono contenere l'attributo data-feedback-for="nome_campo"
 */
export class Error {
    static showError(field, message) {
        $(`[data-feedback-for="${field}"]`).html(message);
    }
    
    static showErrors(errors) {
        clearErrors();
        for (const error of errors) {
            showError(error.field, error.message);
        }
    }
    
    static clearError(field) {
        $(`[data-feedback-for="${field}"]`).html("");
    }
    
    static clearErrors() {
        for (const error of $(`[data-feedback-for]`)) {
            $(error).html("");
        }
    }
}
