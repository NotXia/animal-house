import React from "react";
import { Helmet } from 'react-helmet'
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import moment from "moment";
import Loading from "../../components/Loading";
import CustomerAPI from "modules/api/customer";
import UserAPI from "modules/api/user";
import { getUsername } from "modules/auth";




class Homepage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: null,
            was_vip: false,
            error_message: ""
        };
    }

    async componentDidMount() {
        try {
            this.setState({ was_vip: CustomerAPI.isVIP() });

            await CustomerAPI.completeVIPCheckout();
            this.setState({
                user: await UserAPI.getAllData(await getUsername())
            })
        }
        catch (err) {
            this.setState({ error_message: "Si è verificato un errore" })
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
            
            <main className="mt-3 text-center">
                <p className="text-danger fw-semibold fs-5">{this.state.error_message}</p>
                {
                    this.state.user &&
                    <>
                        <h1 className="m-0">
                            { `${this.state.was_vip ? "Grazie per aver rinnovato il piano VIP" : "Grazie per essere diventato un VIP"}` }
                        </h1>
                        <p className="fs-4">Il tuo abbonamento scade il {moment(this.state.user.vip_until).format("DD/MM/YYYY")}</p>
                        <p className="fs-3 fw-semibold">
                            { `${this.state.was_vip ? "Continua a sfruttare i tuoi esclusivi vantaggi" : "Inizia subito a sfruttare gli esclusivi vantaggi del tuo piano VIP"}` }
                            
                        </p>
                        <img src={`${process.env.REACT_APP_DOMAIN}/img/gifs/happy-cat.gif`} alt="" style={{ maxHeight: "40vh" }} />
                    </>
                }
            </main>

            <Footer />
            </>
        );
    }
}

export default Homepage;