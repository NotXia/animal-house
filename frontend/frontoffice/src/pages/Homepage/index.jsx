import React from "react";
import { Helmet } from 'react-helmet'
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";


class Homepage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <>
            <Helmet>
                <title>Homepage</title>
            </Helmet>

            <Navbar />
            
            <h1>Homepage</h1>

            <Footer />
            </>
        );
    }
}

export default Homepage;