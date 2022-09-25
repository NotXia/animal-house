/**
 * 
 * Componente per gestire gli input testuali lineari (non radio, checkbox, ...)
 * Gestisce validazione e visualizzazione degli errori.
 * Attributi accettati:
 *  - id            id dell'elemento <input>
 *  - name          name dell'elemento <input>
 *  - type          type dell'elemento <input>
 *  - label         label da visualizzare
 *  - validation    funzione che valida il valore dell'input con interfaccia [function(value)] o [async function(value)]
 *  - required      required dell'elento <input>
 * 
 */

import React from "react";

export default class GenericTextInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error_message: "",
            valid: null
        };

        this.inputValidation = this.inputValidation.bind(this);
    }

    render() {
        let required_attr = this.props.required ? "required" : "";
        let invalid_form_class = this.state.valid === false ? "is-invalid" : "";
        let feedback_container_id = `__container-feedback-${this.props.id}`;
        let aria_invalid = this.state.valid === false;
        let success_message = this.state.valid === true ? `${this.props.name} corretto` : "";

        return (<>
            <div>
                <div className="form-floating w-100">
                    <input id={this.props.id} className={`form-control ${invalid_form_class}`}
                            type={this.props.type} required={required_attr}
                            name={this.props.name} placeholder=" " onChange={(e) => this.inputValidation(e)}
                            aria-label={this.props.label} aria-invalid={aria_invalid} aria-errormessage={feedback_container_id} />
                    <label htmlFor={this.props.id} aria-hidden="true">{this.props.label}</label>
                </div>
                <label id={feedback_container_id} data-feedback-for={this.props.name} htmlFor={this.props.id} className="invalid-feedback d-block ms-1" aria-live="assertive">{this.state.error_message}</label>
                <label htmlFor={this.props.id} className="visually-hidden" aria-live="assertive">{success_message}</label>
            </div>
        </>);
    }


    async inputValidation(e) {
        if (this.props.validation) {
            const error = await this.props.validation(e.target.value); // Validazione

            if (error) {
                // Visualizzazione errori
                this.setState({ error_message: error, valid: false });
            }
            else {
                this.setState({ error_message: "", valid: true });
            }
        }
    }
}

