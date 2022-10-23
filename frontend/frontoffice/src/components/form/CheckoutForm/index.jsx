import React, { useEffect, useState, useImperativeHandle  } from "react";
import {
    PaymentElement,
    useStripe,
    useElements
} from "@stripe/react-stripe-js";


export default React.forwardRef((props, ref) => {
    const stripe = useStripe();
    const elements = useElements();

    const [message, setMessage] = useState(null);

    const handlePayment = async (success_url) => {
        if (!stripe || !elements) { return; }

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: success_url,
            },
        });

        if (error.type === "card_error" || error.type === "validation_error") {
            setMessage(error.message);
        } else {
            setMessage("An unexpected error occurred.");
        }
    }

    useImperativeHandle(ref, () => ({
        handlePayment: handlePayment
    }));

    return (
        <form id="payment-form">
            <div id="payment-message" className="invalid-feedback d-block mb-2 fw-semibold text-center">{message}</div>

            <PaymentElement id="payment-element" />
        </form>
    );
} );