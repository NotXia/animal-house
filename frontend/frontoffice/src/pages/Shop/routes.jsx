import MainPage from "./Main";
import ItemPage from "./Item";

let routes = [
    {
        path: "/shop",
        element: <MainPage />,
    },
    {
        path: "/shop/item",
        element: <ItemPage />,
    }
]

export default routes;