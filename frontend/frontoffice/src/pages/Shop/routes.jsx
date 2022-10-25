import MainPage from "./Main";
import ItemPage from "./Item";
import CartPage from "./Cart";
import CheckoutPage from "./Checkout";
import OrderSuccessPage from "./Checkout/OrderSuccess";

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
    },
    {
        path: "/shop/checkout",
        element: <CheckoutPage />,
    },
    {
        path: "/shop/checkout/success",
        element: <OrderSuccessPage />,
    }
]

export default routes;