import Booking from "./index";
import AppointmentSuccess from "./AppointmentSuccess";

let routes = [
    {
        path: "/appointments/book",
        element: <Booking />,
    },
    {
        path: "/appointments/book/success",
        element: <AppointmentSuccess />,
    }
]

export default routes;