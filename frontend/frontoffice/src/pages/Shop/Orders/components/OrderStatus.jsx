/**
 * 
 * Visualizza lo stato di un ordine
 * 
 * Proprietà:
 * - status     Lo stato dell'ordine
 * - type       Tipo dell'ordine (delivery/takeaway)
 * 
 */

import React from "react";


class OrderStatus extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <span className="fs-4">
                <div className="d-flex align-items-center">
                    <img src={ this.getStatusIcon(this.props.status, this.props.type) } alt="" style={{ height: "1.8rem" }} className="me-2" />
                    { this.getStatusText(this.props.status, this.props.type) }
                </div>
            </span>
        );
    }

    getStatusText(status, type) {
        switch (status) {
            case "pending":     return "In attesa di pagamento";
            case "created":     return "Ordine creato";
            case "processed":   return "Ordine in transito";
            case "ready":       return type ==="delivery" ? "In consegna" : "Pronto per il ritiro";
            case "delivered":   return type ==="delivery" ? "Consegnato" : "Ritirato";
            case "cancelled":   return "Cancellato";
        }
    }

    getStatusIcon(status, type) {
        switch (status) {
            case "pending":     return `${process.env.REACT_APP_DOMAIN}/img/icons/payment.png`;
            case "created":     return `${process.env.REACT_APP_DOMAIN}/img/icons/order-created.png`;
            case "processed":   return `${process.env.REACT_APP_DOMAIN}/img/icons/airplane.png`;
            case "ready":       return type ==="delivery" ? `${process.env.REACT_APP_DOMAIN}/img/icons/delivery.png` : `${process.env.REACT_APP_DOMAIN}/img/icons/store.png`;
            case "delivered":   return `${process.env.REACT_APP_DOMAIN}/img/icons/package.png`;
            case "cancelled":   return `${process.env.REACT_APP_DOMAIN}/img/icons/cross.png`;
        }
    }
}

export default OrderStatus;