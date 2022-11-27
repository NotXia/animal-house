import Booking from "./Book";
import Appointments from "./Appointments";
import AppointmentSuccess from "./AppointmentSuccess";

let routes = [
    {
        path: "/appointments",
        element: <Appointments />,
    },
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