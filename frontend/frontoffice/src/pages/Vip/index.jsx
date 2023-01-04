import React from "react";
import { Helmet } from 'react-helmet'
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../../components/form/CheckoutForm";
import { centToPrice } from "modules/currency";
import moment from "moment";
import Loading from "../../components/Loading";
import CustomerAPI from "modules/api/customer";


const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);


class Homepage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            step: "overview",
            stripe_client_secret: null,
        };

        this.payment = React.createRef();
        this.loading = React.createRef();
    }

    componentDidMount() {
        // this.startPayment();
    }

    render() {
        return (
            <>
            <Helmet>
                <title>VIP</title>
            </Helmet>

            <Navbar />
            <Loading ref={this.loading} />
            
            <main className="mt-3">

                {
                    this.state.step === "overview" &&
                    <div className="container">
                        <div className="row text-center">
                            <h1>Scopri la nostra offerta VIP</h1>
                        </div>
                        <div className="row">
                            <div className="col-12 col-md-6 offset-md-3 border py-2">
                                <p className="text-center fs-2">VIP</p>
                                
                                <div className="d-flex justify-content-center">
                                    <button className="btn btn-outline-primary" onClick={() => this.startPayment()}>
                                        Ottieni VIP
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                }

                {
                    this.state.step === "pay" && this.state.stripe_client_secret && 
                    <div className="container">
                        <div className="row">
                            <div className="col-12 col-md-8 offset-md-2 col-lg-6 offset-lg-3">
                                <Elements options={{ clientSecret: this.state.stripe_client_secret }} stripe={stripePromise}>
                                    <CheckoutForm ref={this.payment} />
                                </Elements>
                            </div>
                        </div>

                        <div className="row mt-3">
                            <div className="d-flex justify-content-center">
                                <button className="btn btn-outline-success btn-lg" onClick={() => this.completePayment()}>Paga</button>
                            </div>
                        </div>
                    </div>
                }
            </main>


            <Footer />
            </>
        );
    }

    async startPayment() {
        try {
            const payment_data = await CustomerAPI.startVIPCheckout();
            console.log(payment_data)

            this.setState({ stripe_client_secret: payment_data.clientSecret, step: "pay" });
        }
        catch (err) {
            this.setState({ error_message: "Non è stato possibile creare avviare il pagamento" });
        }
    }

    async completePayment() {
        this.loading.current.wrap(async () => {
            await this.payment.current.handlePayment(`http://localhost:3000/fo/vip/success`);
            // await this.payment.current.handlePayment(`${process.env.REACT_APP_DOMAIN}${process.env.REACT_APP_BASE_PATH}/vip/success`);
        });
    }
}

export default Homepage;