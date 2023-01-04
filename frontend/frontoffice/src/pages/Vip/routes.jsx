import VipPage from "./index";
import SuccessPage from "./success";

let routes = [
    {
        path: "/vip",
        element: <VipPage />,
    },
    {
        path: "/vip/success",
        element: <SuccessPage />,
    }
]

export default routes;