import React from "react";
import { Helmet } from "react-helmet";
import $ from "jquery";
import Navbar from "../../../components/Navbar";
import SearchParamsHook from "../../../hooks/SearchParams";
import { Link } from "react-router-dom";
import Footer from "../../../components/Footer";


class OrderSuccess extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };

        const order_id = this.props.searchParams.get("order_id");
        $.ajax({
            method: "POST", url: `${process.env.REACT_APP_DOMAIN}/shop/orders/${encodeURIComponent(order_id)}/success`
        })
    }

    render() {
        return (<>
            <Helmet>
                <title>Ordine creato con successo</title>
            </Helmet>
            
            <Navbar />

            <main className="mt-3 w-100">
                <div className="d-flex justify-content-center">
                    <img src="https://thumbs.gfycat.com/ForcefulMintyKarakul-size_restricted.gif" alt="" style={{ height: "20rem" }} />
                </div>
    
                <p className="text-center fs-2 fw-semibold">Grazie per aver acquistato da Animal House</p>

                <div className="d-flex justify-content-center">
                    <Link to="/shop/orders">
                        <button className="btn btn-outline-success p-2 px-4">
                            <span className="fs-5">Controlla lo stato dell'ordine</span>
                        </button>
                    </Link>
                </div>
            </main>

            <Footer />
        </>);
    }

}

export default SearchParamsHook(OrderSuccess);