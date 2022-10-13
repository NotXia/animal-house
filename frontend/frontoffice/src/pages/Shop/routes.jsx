import MainPage from "./Main";
import ItemPage from "./Item";
import CartPage from "./Cart";

let routes = [
    {
        path: "/shop",
        element: <MainPage />,
    },
    {
        path: "/shop/item",
        element: <ItemPage />,
    },
    {
        path: "/shop/cart",
        element: <CartPage />,
    }
]

export default routes;