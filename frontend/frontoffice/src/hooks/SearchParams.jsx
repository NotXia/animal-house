import { useSearchParams } from "react-router-dom";

export default function SearchParamsHook(Component) {
    return function (props) {
        let [searchParams, setSearchParams] = useSearchParams();
        return <Component {...props} searchParams={searchParams} />;
    }
}