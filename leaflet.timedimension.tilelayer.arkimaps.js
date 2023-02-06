/*
 * L.TimeDimension.Layer.TileLayer.Arkimaps: TimeDimension TileLayer for Arkimaps.
 */

L.TimeDimension.Layer.TileLayer = L.TimeDimension.Layer.extend({});

L.timeDimension.layer.tileLayer = function(layer, options) {
    return new L.TimeDimension.Layer.TileLayer(layer, options);
};

L.TimeDimension.Layer.TileLayer.ArkimapsChached = L.TimeDimension.Layer.TileLayer.extend({
    options: {
        reftime: new Date(),
        steps: [],
        opacity: 0.6,
        zIndex: 1,
        minNativeZoom: 5,
        maxNativeZoom: 7,
        tms: false,
        bounds: null
    },
    initialize: function(options) {
        // Rimuovo eventuali undefined.
        Object.keys(options).forEach(key => options[key] == undefined && delete options[key]);
        L.setOptions(this, options || {});
        const layer = L.tileLayer(`${this.options.baseUrl}/${this.options.modelName}/{d}/${this.options.productName}+{h}/{z}/{x}/{y}.png`, {
            minNativeZoom: this.options.minNativeZoom,
            maxNativeZoom: this.options.maxNativeZoom,
            tms: this.options.tms,
            opacity: this.options.opacity,
            zIndex: this.options.zIndex + 1,
            bounds: this.options.bounds,
            attribution: `${this.options.modelName} - ${this.options.productDescription}`
        });
        this.options.times = this.options.steps.map(step => new Date(this.options.reftime.getTime() + step * 3600 * 1000).getTime()),
        L.TimeDimension.Layer.TileLayer.prototype.initialize.call(this, layer, this.options);
        this._baselayer = layer;
        this._reftime = this.options.reftime;
        this._layers = Object.fromEntries(this.options.times.map(time => [time, this._createLayerForTime(time)]));
        this._currentLayer = null;
        this._opacity = this._baselayer.options.opacity || 1;
        this.legendUrl = this._getUrlForTime(`${this.options.baseUrl}/${this.options.modelName}/{d}/${this.options.productName}+legend.png`);
        this.hasLegend = this.options.legendOn;
    },
    _getUrlForTime: function(baseurl, time) {
        const options = this._baseLayer.options;
        let step = "";
        if (time != null) {
            const valtime = new Date(time);
            step = Math.round((valtime.getTime() - this._reftime.getTime()) / (1000 * 3600));
        }
        const url = baseurl
            .replace("{d}", this._reftime.toISOString().split(".")[0])
            .replace("{h}", new String(step).padStart(3, '0'));
        return url;
    },
    _createLayerForTime: function(time){
        const url = this._getUrlForTime(this._baseLayer.getURL(), time);
        const layer = new this._baseLayer.constructor(url, this._baseLayer.options);
        layer.on('load', (function(layer, time) {
           layer.setLoaded(true);
        }).bind(this, layer, time));
        return layer;
    },
    _onNewTimeLoading: function(ev) {
        const time = ev.time;
        if (!this._layers.hasOwnProperty(time)) {
            return true;
        }
        const layer = this._layers[time];
        if (this._map && !this._map.hasLayer(layer)) {
            this._map.addLayer(layer);
        }
        if (layer != this._currentLayer) {
            this._hideLayer(layer);
        }
    },
    isReady: function(time) {
        if (!this._layers.hasOwnProperty(time)) {
            return true;
        }
        return this._layers[time].isLoaded();
    },
    _update: function() {
        const time = this._timeDimension.getCurrentTime();
        if (!this._layers.hasOwnProperty(time)) {
	    if (this._currentLayer) {
                this._hideLayer(this._currentLayer);
		this._currentLayer = null;
	    }
            return;
        }
        const previousLayer = this._currentLayer;
        this._currentLayer = this._layers[time];
        if (previousLayer && previousLayer != this._currentLayer) {
            this._hideLayer(previousLayer);
        }
        if (!this._map.hasLayer(this._currentLayer)) {
            this._map.addLayer(this._currentLayer);
        }
        this._showLayer(this._currentLayer);
    },
    _showLayer: function(layer) {
        layer.setOpacity(this._opacity);
    },
    _hideLayer: function(layer) {
        layer.setOpacity(0);
    },
    setZIndex: function(number) {
        for (const [time, layer] of Object.entries(this._layers)) {
            layer.setZIndex(number);
        }
    },
    eachLayer: function(method, context) {
        if (this._currentLayer) {
            method.call(context, this._currentLayer);
        }
        return L.TimeDimension.Layer.TileLayer.prototype.eachLayer.call(this, method, context);
    },
});

L.timeDimension.layer.tileLayer.arkimapsCached = function(options) {
    return new L.TimeDimension.Layer.TileLayer.ArkimapsChached(options);
};
