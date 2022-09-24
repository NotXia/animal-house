import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Homepage from "./routes/Homepage";
import NotFound from "./routes/NotFound";


const router = createBrowserRouter([
    {
        path: "/",
        element: <Homepage />,
        errorElement: <NotFound />,
        // children: [{}],
    }
]);


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);

