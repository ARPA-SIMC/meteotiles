L.Control.Legend = L.Control.extend({
    onAdd: function(map) {
        const div = L.DomUtil.create("div", "leaflet-control-legend");
        this._div = div;
        this._legendUrls = {};
        return div;
    },
    onRemove: function(map) {
    },
    addLegend: function(url, options) {
        const opts = {
            opacity: 1,
            ...options,
        }
        this._legendUrls[url] = opts;
        this.redrawLegend();
    },
    removeLegend: function(url, options) {
        delete this._legendUrls[url];
        this.redrawLegend();
    },
    redrawLegend: function() {
        let innerHTML = "";
        for (const [url, options] of Object.entries(this._legendUrls)) {
            innerHTML += `<img src="${url}" style="opacity:${options.opacity};"/>`;
        };
        this._div.innerHTML = innerHTML;
    }
});

L.control.legend = function(legendUrl, options) {
    return new L.Control.Legend(legendUrl, options);
};
