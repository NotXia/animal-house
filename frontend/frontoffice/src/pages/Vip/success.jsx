import React from "react";
import { Helmet } from 'react-helmet'
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import moment from "moment";
import Loading from "../../components/Loading";
import CustomerAPI from "modules/api/customer";




class Homepage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stripe_client_secret: null,
        };

        this.payment = React.createRef();
        this.loading = React.createRef();
    }

    async componentDidMount() {
        await CustomerAPI.completeVIPCheckout();
    }

    render() {
        return (
            <>
            <Helmet>
                <title>VIP</title>
            </Helmet>

            <Navbar />
            <Loading ref={this.loading} />
            
            <h1>VIP ottenuto con successo</h1>

            

            <Footer />
            </>
        );
    }
}

export default Homepage;