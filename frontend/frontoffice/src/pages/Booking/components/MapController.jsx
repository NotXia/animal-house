import { useMap } from "react-leaflet";

export default function MapController(props) {
    const map = useMap();

    if (props.setMap) {
        props.setMap(map);
    }

    return null;
}