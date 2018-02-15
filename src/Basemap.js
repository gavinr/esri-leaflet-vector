import L from 'leaflet';
import { Util } from 'esri-leaflet';
import { fetchMetadata } from './Util';

export var Basemap = L.Layer.extend({
  statics: {
    URLPREFIX: 'https://www.arcgis.com/sharing/rest/content/items/',
    URLSUFFIX: '/resources/styles/root.json',
    STYLES: {
      'DarkGray': '5e9b3685f4c24d8781073dd928ebda50',
      'Gray': '291da5eab3a0412593b66d384379f89f',
      'Hybrid': '30d6b8271e1849cd9c3042060001f425',
      'Navigation': '63c47b7177f946b49902c24129b87252',
      'Streets': 'de26a3cf4cc9451298ea173c4b324736',
      'StreetsNight': '86f556a2d1fd468181855a35e344567f',
      'StreetsRelief': '41597245552743d5910de614d47e748c',
      'Topographic': '7dc6cea0b1764a1f9af2e679f642f0f5',
      'Spring': '702566e7a74a4ebbb84f601e0514879a',
      'Newspaper': 'dfb04de5f3144a80bc3f9f336228d24a',
      'MidCentury': '7675d44bb1e4428aa2c30a9b68f97822',
      'ModernAntique': 'effe3475f05a4d608e66fd6eeb2113c0',
      'BlackAndWhite': '3161443179244702a5e0449010013b54'
    }
  },

  initialize: function (options) {
    // L.Layer expects a JSON object literal to be passed in constructor
    options = {
      key: options
    };

    if (typeof options.key === 'string' && Basemap.STYLES[options.key]) {
      var url = Basemap.URLPREFIX + Basemap.STYLES[options.key] + Basemap.URLSUFFIX;
      fetchMetadata(url, this);
    } else {
      throw new Error('L.esri.Vector.Basemap: Invalid parameter. Use one of "DarkGray", "Gray", "Hybrid", "Navigation", "Streets", "StreetsNight", "StreetsRelief", "Topographic"');
    }
  },

  onAdd: function (map) {
    this._map = map;

    Util.setEsriAttribution(map);

    if (map.attributionControl) {
      // 95% sure this is the right static attribution url
      Util._getAttributionData('https://static.arcgis.com/attribution/World_Street_Map', map);
      map.attributionControl.addAttribution('<span class="esri-dynamic-attribution">USGS, NOAA</span>');
    }

    if (this._ready) {
      this._asyncAdd();
    } else {
      this.once('ready', function () {
        this._asyncAdd();
      }, this);
    }
  },

  onRemove: function (map) {
    map.off('moveend', Util._updateMapAttribution);
    map.removeLayer(this._mapboxGL);

    if (map.attributionControl) {
      var vectorAttribution = document.getElementsByClassName('esri-dynamic-attribution')[0].outerHTML;
      // this doesn't work, not sure why.
      map.attributionControl.removeAttribution(vectorAttribution);
    }
  },

  _asyncAdd: function () {
    var map = this._map;

    // set the background color of the map to the background color of the tiles
    map.getContainer().style.background = this._mapboxGL.options.style.layers[0].paint['background-color'];

    map.on('moveend', Util._updateMapAttribution);
    this._mapboxGL.addTo(map, this);
  }
});

export function basemap (key) {
  return new Basemap(key);
}

export default Basemap;
