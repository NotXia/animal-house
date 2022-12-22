import React from "react";
import moment from "moment";


export default class FooterComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    
    render() {
        return (<>
            <footer className="mt-5 mb-3">
                <div className="w-100 text-center">
                    <a href="/" className="link-dark mx-2">Home</a>
                    <a href="/fo/shop" className="link-dark mx-2">Shop</a>
                    <a href="/services-list" className="link-dark mx-2">Servizi</a>
                    <a href="/hubs-list" className="link-dark mx-2">Sedi</a>
                    <a href="/fo/forum" className="link-dark mx-2">Forum</a>
                    <hr />
                    <p className="m-0">&copy; Animal House { moment().format("YYYY") }</p>
                    <p className="m-0" style={{ fontSize: "0.7rem" }}>Questo è un progetto universitario, riferimenti a entità reali sono puramente casuali</p>
                </div>
            </footer>
        </>);
    }
}
