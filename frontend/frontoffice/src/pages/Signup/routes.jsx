import Signup from "./index";
import Success from "./success";
import Verify from "./verify";

let routes = [
    {
        path: "/signup",
        element: <Signup />,
    },
    {
        path: "/signup/success",
        element: <Success />,
    },
    {
        path: "/signup/verify",
        element: <Verify />,
    }
]

export default routes;