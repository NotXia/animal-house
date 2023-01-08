import Signup from "./index";
import Success from "./success";

let routes = [
    {
        path: "/signup",
        element: <Signup />,
    },
    {
        path: "/signup/success",
        element: <Success />,
    }
]

export default routes;