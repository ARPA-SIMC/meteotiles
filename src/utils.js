export function convertBoundingBoxToLeafletBounds(boundingBox) {
    return L.latLngBounds(
        L.latLng(boundingBox.latMin, boundingBox.lonMin),
        L.latLng(boundingBox.latMax, boundingBox.lonMax),
    );
}
