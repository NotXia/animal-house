import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import homepage_routes from "./pages/Homepage/routes";
import signup_routes from "./pages/Signup/routes";
import login_routes from "./pages/Login/routes";
import logout_routes from "./pages/Logout/routes";
import shop_routes from "./pages/Shop/routes";
import forum_routes from "./pages/Forum/routes";


let routes = [];
routes = routes.concat(homepage_routes);
routes = routes.concat(signup_routes);
routes = routes.concat(login_routes);
routes = routes.concat(logout_routes);
routes = routes.concat(shop_routes);
routes = routes.concat(forum_routes);

routes.push({ path: "/*", loader: () => { window.location.href="/not-found.html" } }); // Gestione not found (lasciare come ultimo route)
const router = createBrowserRouter(routes, { basename: process.env.REACT_APP_BASE_PATH });


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <RouterProvider router={router} />
);

