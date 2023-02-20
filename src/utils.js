export function convertBoundingBoxToLeafletBounds(boundingBox) {
    return L.latLngBounds(
        L.latLng(boundingBox.latMin, boundingBox.lonMin),
        L.latLng(boundingBox.latMax, boundingBox.lonMax),
    );
}

// From https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#ECMAScript_(JavaScript/ActionScript,_etc.)
function lon2tile(lon,zoom) { return (Math.floor((lon+180)/360*Math.pow(2,zoom))); }
function lat2tile(lat,zoom)  { return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom))); }


function geographicCoordsToTileBounds(map, latlng) {
    const zoom = map.getZoom();
    const i = lon2tile(latlng.lng, zoom)
    const j = lat2tile(latlng.lat, zoom)
    const coords = L.point(i, j);
    const tileSize = L.point(256, 256);
    const nwPoint = coords.scaleBy(tileSize);
    const sePoint = nwPoint.add(tileSize);
    const nw = map.unproject(nwPoint, zoom);
    const se = map.unproject(sePoint, zoom);
    const bounds = L.latLngBounds(nw, se);
    return bounds;
}

export function extendBoundsToTiles(map, bounds) {
    const boundsSW = geographicCoordsToTileBounds(map, bounds.getSouthWest());
    const boundsNE = geographicCoordsToTileBounds(map, bounds.getNorthEast());
    const newBounds = boundsSW.extend(boundsNE);
    return newBounds;
}
