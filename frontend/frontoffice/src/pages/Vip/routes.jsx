import VipPage from "./index";
import PaymentPage from "./payment";
import SuccessPage from "./success";

let routes = [
    {
        path: "/vip",
        element: <VipPage />,
    },
    {
        path: "/vip/pay",
        element: <PaymentPage />,
    },
    {
        path: "/vip/success",
        element: <SuccessPage />,
    }
]

export default routes;