/**
 * 
 * Componente per gestire gli input testuali lineari (non radio, checkbox, ...)
 * Gestisce validazione e visualizzazione degli errori.
 * Attributi accettati:
 *  - id            id dell'elemento <input>
 *  - name          name dell'elemento <input>
 *  - type          type dell'elemento <input>
 *  - label         label da visualizzare
 *  - validation    funzione che valida il valore dell'input con interfaccia {{ [async] function(value, required) }}
 *  - required      required dell'elemento <input>
 * 
 * Funzioni esposte:
 *      async validate()     valida l'input
 *      value()           restituisce il valore dell'input
 *      focus()              mette il focus sull'input
 * 
 */

import React from "react";
import $ from "jquery";

export default class TextInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: "",

            error_message: "",
            valid: null,
            hadError: false
        };

        this.validation_delay;
        this._inputValidation = this._inputValidation.bind(this);
        this.validate = this.validate.bind(this);
        this.value = this.value.bind(this);
        this.focus = this.focus.bind(this);
    }

    render() {
        let required_attr = this.props.required ? "required" : "";
        let invalid_form_class = this.state.valid === false ? "is-invalid" : "";
        let feedback_container_id = `__container-feedback-${this.props.id}`;
        let aria_invalid = this.state.valid === false;
        let success_message = (this.state.valid === true && this.state.hadError) ? `${this.props.label} corretto` : "";

        return (<>
            <div>
                <div className="form-floating w-100">
                    <input id={this.props.id} className={`form-control ${invalid_form_class}`}
                            type={this.props.type} required={required_attr}
                            name={this.props.name} placeholder=" " onChange={(e) => this._inputValidation(e)}
                            aria-label={this.props.label} aria-invalid={aria_invalid} aria-errormessage={feedback_container_id} />
                    <label htmlFor={this.props.id} aria-hidden="true">{this.props.label}</label>
                </div>
                <label id={feedback_container_id} data-feedback-for={this.props.name} htmlFor={this.props.id} className="invalid-feedback d-block ms-1" aria-live="assertive">{this.state.error_message}</label>
                <label htmlFor={this.props.id} className="visually-hidden" aria-live="assertive">{success_message}</label>
            </div>
        </>);
    }


    async _inputValidation(e) {
        this.setState({ value: e.target.value });

        clearTimeout(this.validation_delay); // Annulla il timer precedente
        if (this.props.validation) {
            this.validation_delay = setTimeout((async function() {
                this.validate();
            }).bind(this), 200);
        }
    }

    /**
     * Valida l'input attuale
     */
    async validate() {
        if (this.props.validation) {
            const error = await this.props.validation(this.state.value, this.props.required); // Validazione
                
            if (error)  { 
                this.setState({ error_message: error, valid: false, hadError: true }); 
                return false; 
            }
            else { 
                this.setState({ error_message: "", valid: true }); 
                return true; 
            }
        }
    }

    /**
     * Restituisce il valore dell'input attuale
     */
    value() {
        return this.state.value;
    }

    /**
     * Mette il focus sull'input
     */
    focus() {
        $(`#${this.props.id}`).trigger("focus");
    }
}

