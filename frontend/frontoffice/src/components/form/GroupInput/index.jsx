/**
 * 
 * Componente per gestire gli input radio e checkbox
 * Gestisce validazione e visualizzazione degli errori.
 * Attributi accettati:
 *  - id            id dell'elemento <input>
 *  - name          name dell'elemento <input>
 *  - type          type dell'elemento <input> (radio o checkbox)
 *  - inline        se si vogliono le opzioni inline
 *  - label         label da visualizzare
 *  - required      required dell'elemento
 *  - fields        vettore dei campi nella forma [ { label: "...", value: "..." }, ... ]
 * 
 * Funzioni esposte:
 *      validate()          valida l'input
 *      value()             restituisce il valore dell'input
 *      focus()             mette il focus sul primo input
 *      writeError(msg)     inserisce un messaggio (esterno) di errore
 */

import React from "react";
import $ from "jquery";

export default class GroupInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error_message: "",
            valid: null,
        };

        this.validate = this.validate.bind(this);
        this.value = this.value.bind(this);
        this.focus = this.focus.bind(this);
        this.writeError = this.writeError.bind(this);
    }
    

    render() {
        let aria_required = this.props.required ? true : false;
        let aria_invalid = this.state.valid === false;
        let inline_class = this.props.inline ? "form-check-inline" : "";

        return (<>
            <div>
                <fieldset id={`__fieldset-group-${this.props.name}`} className="w-100" aria-required={aria_required}>
                    <legend className="fs-5" id={`__legend-group-${this.props.name}`} aria-required={aria_required}>{this.props.label}</legend>
                    {
                        this.props.fields.map((field, index) => {
                            let field_id = `__input-field-${this.props.name}-${field.value}-${index}`;

                            return (
                                <div className={`form-check ${inline_class}`} key={index}>
                                    <input className="form-check-input" id={field_id} 
                                            type={this.props.type} name={this.props.name} value={field.value} onChange={(e) => this.validate()} 
                                            aria-invalid={aria_invalid} />
                                    <label className="form-check-label" htmlFor={field_id}>{field.label}</label>
                                </div>
                            )
                        })
                    }
                </fieldset>
                <label data-feedback-for={this.props.name} className="invalid-feedback d-block ms-1" aria-live="assertive">{this.state.error_message}</label>
            </div>
        </>);
    }

    /**
     * Valida l'input attuale
     */
    validate() {
        if (this.props.required && $(`#__fieldset-group-${this.props.name} input:checked`).length === 0) {
            this.setState({ error_message: "Nessun valore selezionato", valid: false });
            return false;
        }
        else { 
            this.setState({ error_message: "", valid: true });
            return true;
        }
    }

    /**
     * Restituisce il valore dell'input attuale
     */
    value() {
        if ($(`#__fieldset-group-${this.props.name} input:checked`).length === 0) { return null; }

        if (this.props.type === "radio") {
            return $(`#__fieldset-group-${this.props.name} input:checked`).val();
        }
        else {
            return $.map($(`#__fieldset-group-${this.props.name} input:checked`), (checkbox) => $(checkbox).val());
        }
    }

    /**
     * Mette il focus sull'input
     */
    focus() {
        $( $(`#__fieldset-group-${this.props.name} input`)[0] ).trigger("focus");
    }

    /**
     * Inserisce manualmente un messaggio di errore
     */
    writeError(error_message) {
        this.setState({ error_message: error_message, valid: false });
    }
}

