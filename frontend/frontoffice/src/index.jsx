import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import homepage_routes from "./pages/Homepage/routes";
import signup_routes from "./pages/Signup/routes";
import login_routes from "./pages/Login/routes";


let routes = [];
routes = routes.concat(homepage_routes);
routes = routes.concat(signup_routes);
routes = routes.concat(login_routes);

routes.push({ path: "/*", loader: () => { window.location.href="/not-found.html" } }); // Gestione not found (lasciare come ultimo route)
const router = createBrowserRouter(routes, { basename: process.env.REACT_APP_BASE_PATH });


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);

