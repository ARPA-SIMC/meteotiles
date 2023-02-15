export function convertBoundingBoxToLeafletBounds(boundingBox) {
    return L.latLngBounds(
        L.latLng(boundingBox.latMin, boundingBox.lonMin),
        L.latLng(boundingBox.latMax, boundingBox.lonMax),
    );
}

function lng2tile(lon, z) {
    return (Math.floor((lon+180)/360*Math.pow(2,z)))
}

function lat2tile(lat, z)  {
    return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,z)))
}

export function geographicCoordsToTileBounds(map, latlng) {
    const x = lat2tile(latlng.lat, map.getZoom());
    const y = lng2tile(latlng.lng, map.getZoom());
    const coords = L.point(x, y);
    const nw = map.unproject(coords, map.getZoom());
    const se = map.unproject(coords, map.getZoom());
    return L.latLngBounds(se, nw);
}
