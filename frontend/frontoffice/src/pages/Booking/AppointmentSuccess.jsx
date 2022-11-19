import React from "react";
import { Helmet } from "react-helmet";
import $ from "jquery";
import Navbar from "../../components/Navbar";
import SearchParamsHook from "../../hooks/SearchParams";
import { Link } from "react-router-dom";
import BookingAPI from "modules/api/booking";


class OrderSuccess extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };

        const appointment_id = this.props.searchParams.get("appointment_id");
        BookingAPI.confirmPayment(appointment_id);
    }

    render() {
        return (<>
            <Helmet>
                <title>Appuntamento creato con successo</title>
            </Helmet>
            
            <Navbar />

            <main className="mt-3 w-100">
                <div className="d-flex justify-content-center">
                    <img src="https://thumbs.gfycat.com/ForcefulMintyKarakul-size_restricted.gif" alt="" style={{ height: "20rem" }} />
                </div>
    
                <p className="text-center fs-2 fw-semibold">Grazie per aver scelto Animal House</p>

                <div className="d-flex justify-content-center">
                    <Link to="">
                        <button className="btn btn-outline-success p-2 px-4">
                            <span className="fs-5">Controlla i tuoi appuntamenti</span>
                        </button>
                    </Link>
                </div>
            </main>
        </>);
    }

}

export default SearchParamsHook(OrderSuccess);