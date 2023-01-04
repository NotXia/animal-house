import React from "react";
import { Helmet } from 'react-helmet'
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../../components/form/CheckoutForm";
import { centToPrice } from "modules/currency";
import Loading from "../../components/Loading";
import CustomerAPI from "modules/api/customer";
import { isAuthenticated } from "modules/auth";


const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);


class Homepage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            price: 0,
            stripe_client_secret: null,

            error_message: ""
        };

        this.payment = React.createRef();
        this.loading = React.createRef();
    }

    componentDidMount() {
        isAuthenticated().then(is_auth => { if (!is_auth) { window.location = `${process.env.REACT_APP_BASE_PATH}/login?return=${window.location.href}`; } } );
        
        this.loading.current.wrap(async () => {
            try {
                const payment_data = await CustomerAPI.startVIPCheckout();
                
                this.setState({ 
                    stripe_client_secret: payment_data.clientSecret,
                    price: await CustomerAPI.getVIPPrice()
                });
            }
            catch (err) {
                this.setState({ error_message: "Non è stato possibile creare avviare il pagamento" });
            }
        });
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
                    this.state.stripe_client_secret && 
                    <div className="container">
                        <div className="row text-center">
                            <h1 className="m-0">Pagamento</h1>
                            <p className="fs-4 fw-semibold">{centToPrice(this.state.price)}€ per un anno di VIP</p>
                        </div>

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


    async completePayment() {
        this.loading.current.wrap(async () => {
            await this.payment.current.handlePayment(`http://localhost:3000/fo/vip/success`);
            // await this.payment.current.handlePayment(`${process.env.REACT_APP_DOMAIN}${process.env.REACT_APP_BASE_PATH}/vip/success`);
        });
    }
}

export default Homepage;