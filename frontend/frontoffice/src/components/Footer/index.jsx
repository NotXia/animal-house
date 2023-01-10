import React from "react";
import moment from "moment";
import { isAuthenticated } from "modules/auth";


export default class FooterComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            is_auth: false
        };
    }

    async componentDidMount() {
        this.setState({ is_auth: await isAuthenticated() });
    }

    
    render() {
        return (<>
            <footer className="mt-5 mb-3">
                <div className="w-100 text-center">
                    <div style={{ overflowWrap: "normal" }}>
                        <p>
                            <a href="/" className="link-dark mx-2 d-inline-block">Home</a>
                            <a href="/services-list" className="link-dark mx-2 d-inline-block">Servizi</a>
                            <a href="/fo/shop" className="link-dark mx-2 d-inline-block">Shop</a>
                            <a href="/hubs-list" className="link-dark mx-2 d-inline-block">Sedi</a>
                            <a href="/fo/forum" className="link-dark mx-2 d-inline-block">Forum</a>
                            <a href="/play" className="link-dark mx-2 d-inline-block">Giochi</a>
                            { !this.state.is_auth && <a href="/fo/my-animals" className="link-dark mx-2 d-inline-block">Presentati</a> }
                            { this.state.is_auth && <a href="/fo/vip" className="link-dark mx-2 d-inline-block">VIP</a> }
                        </p>
                    </div>
                    <hr />
                    <p className="m-0">&copy; Animal House { moment().format("YYYY") }</p>
                    <p className="m-0" style={{ fontSize: "0.7rem" }}>Questo è un progetto universitario, riferimenti a entità reali sono puramente casuali</p>
                </div>
            </footer>
        </>);
    }
}

