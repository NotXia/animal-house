import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import homepage_routes from "./pages/Homepage/routes";


let routes = [];
routes = routes.concat(homepage_routes);

const router = createBrowserRouter(routes);


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);

