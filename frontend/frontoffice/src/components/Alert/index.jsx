/**
 * Visualizza un alert
 * 
 * Proprietà:
 * - type       Tipo di alert (primary, secondary, ...)
 */

import React from "react";

class Alert extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            show: false
        };
    }

    render() {
        return (<>
            <div className={`d-flex justify-content-center align-items-start ${this.state.show ? "" : "d-none"}`}>
                <div class={`alert alert-${this.props.type} alert-dismissible`} role="alert" aria-aria-live="polite">
                    {this.props.children}
                    <button type="button" class="btn-close" aria-label="Chiudi messaggio" onClick={() => this.hide()} ></button>
                </div>
            </div>
        </>);
    }

    show() { this.setState({ show: true }); }
    hide() { this.setState({ show: false }); }
}

export default Alert;