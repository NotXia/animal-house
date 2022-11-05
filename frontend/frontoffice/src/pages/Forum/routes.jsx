import MainPage from "./Main";
import SinglePostPage from "./SinglePost";

let routes = [
    {
        path: "/forum",
        element: <MainPage />,
    },
    {
        path: "/forum/post",
        element: <SinglePostPage />,
    }
]

export default routes;