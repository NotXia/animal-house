import React from "react";
import { Helmet } from 'react-helmet'
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { centToPrice } from "modules/currency";
import moment from "moment";
import Loading from "../../components/Loading";
import CustomerAPI from "modules/api/customer";
import UserAPI from "modules/api/user";
import { getUsername, isAuthenticated } from "modules/auth";


class Homepage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            step: null, // [recap, overview]
            price: 0,

            error_message: ""
        };

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
                    this.state.step &&
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
                                <section aria-label="Descrizione piano VIP">
                                    <p className="fs-2 m-0 fw-semibold">VIP Animal House</p>
                                    <p className="visually-hidden">{centToPrice(this.state.price)}€ per un anno di abbonamento</p>
                                    <p className="fs-3 fw-semibold m-0" aria-hidden="true">{centToPrice(this.state.price)}€</p>
                                    <p className="fs-5 muted" aria-hidden="true">per un anno di abbonamento</p>
                                    
                                    <h2 className="fs-5 fw-semibold m-0 text-decoration-underline">Vantaggi</h2>
                                    <ul style={{ listStyleType: "none" }}>
                                        <li className="fs-5 m-0">Sconti esclusivi per i tuoi acquisti nello shop</li>
                                        <li className="fs-5 m-0">Riduzione del prezzo dei servizi che prenoti</li>
                                        <li className="fs-5 m-0">Elaborazione prioritaria dei tuoi ordini</li>
                                        <li className="fs-5 m-0">Un addetto dedicato a te quando vieni a trovarci</li>
                                        <li className="fs-5 m-0">Un esclusivo badge per distinguerti nel forum</li>
                                    </ul>
                                </section>

                                <section aria-label="Acquista il piano VIP">
                                    <div className="d-flex justify-content-center mb-2">
                                        <a className="btn btn-primary" href={`${process.env.REACT_APP_BASE_PATH}/vip/pay`}>
                                        {
                                            this.state.step === "overview" && "Ottieni VIP"
                                        }
                                        {
                                            this.state.step === "recap" && "Rinnova VIP"
                                        }
                                        </a>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                }

            </main>

            <Footer />
            </>
        );
    }
}

export default Homepage;