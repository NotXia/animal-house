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
import UserAPI from "modules/api/user";
import { getUsername, isAuthenticated } from "modules/auth";


const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);


class Homepage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            step: "", // [recap, overview, pay]
            price: 0,
            stripe_client_secret: null,

            error_message: ""
        };

        this.payment = React.createRef();
        this.loading = React.createRef();
    }

    async componentDidMount() {
        isAuthenticated().then(is_auth => { if (!is_auth) { window.location = `${process.env.REACT_APP_BASE_PATH}/login?return=${window.location.href}`; } } );

        try {
            this.setState({ 
                price: await CustomerAPI.getVIPPrice(),
                step: await CustomerAPI.isVIP() ? "recap" : "overview",
                vip_until: (await UserAPI.getAllData(await getUsername())).vip_until
            });
        }
        catch (err) {
            this.setState({ error_message: "Non è stato possibile caricare la pagina" });
        }
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
                    this.state.step !== "pay" &&
                    <div className="container">
                        <div className="row text-center">
                            {
                                this.state.step === "overview" &&
                                <h1>Scopri la nostra offerta VIP</h1>
                            }
                            {
                                this.state.step === "recap" &&
                                <>
                                    <h1 className="m-0 fw-semibold">Grazie per essere un nostro VIP</h1>
                                    <p className="text-center fs-3 m-0">Il tuo abbonamento scade il {moment(this.state.vip_until).format("DD/MM/YYYY")}</p>
                                    <p className="text-center fs-4">Puoi decidere di estendere la durata in qualunque momento</p>
                                </>
                            }
                        </div>
                        <div className="row">
                            <div className="col-12 col-md-6 offset-md-3 border border-primary rounded py-2 text-center">
                                <p className="fs-2 m-0 fw-semibold">VIP Animal House</p>
                                <p className="fs-3 fw-semibold m-0">{centToPrice(this.state.price)}€</p>
                                <p className="fs-5 muted">per un anno di abbonamento</p>
                                
                                <h2 className="fs-5 fw-semibold m-0 text-decoration-underline">Vantaggi</h2>
                                <ul style={{ listStyleType: "none" }}>
                                    <li className="fs-5 m-0">Sconti esclusivi per i tuoi acquisti nello shop</li>
                                    <li className="fs-5 m-0">Riduzione del prezzo dei servizi che prenoti</li>
                                    <li className="fs-5 m-0">Elaborazione prioritaria dei tuoi ordini</li>
                                    <li className="fs-5 m-0">Un addetto dedicato a te quando vieni a trovarci</li>
                                    <li className="fs-5 m-0">Un esclusivo badge per distinguerti nel forum</li>
                                </ul>

                                <div className="d-flex justify-content-center mb-2">
                                    <button className="btn btn-primary" onClick={() => this.startPayment()}>
                                    {
                                        this.state.step === "overview" && "Ottieni VIP"
                                    }
                                    {
                                        this.state.step === "recap" && "Rinnova VIP"
                                    }
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                }

                {
                    this.state.step === "pay" && this.state.stripe_client_secret && 
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

    async startPayment() {
        try {
            const payment_data = await CustomerAPI.startVIPCheckout();

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