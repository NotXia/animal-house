import React from "react";

class Loading extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            is_loading: false
        };
    }

    render() {
        return (<>
            <div className={`position-absolute top-0 start-0 w-100 min-vh-100 ${this.state.is_loading ? "" : "d-none"}`} style={{ backgroundColor: "#aaaaaa70", zIndex: Number.MAX_SAFE_INTEGER }}>
                <div className="d-flex justify-content-center align-items-center w-100 min-vh-100">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Caricamento</span>
                    </div>
                </div>
            </div>
        </>);
    }

    show() { this.setState({ is_loading: true }); }
    hide() { this.setState({ is_loading: false }); }

    async wrap(func) { 
        this.show();

        try {
            await func();
        }
        catch (err) {
            this.hide();
            throw err;
        }

        this.hide();
    }
}

export default Loading;