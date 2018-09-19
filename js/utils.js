var utils = (function () {

    var _WMTSTileMatrix = {};

    var _WMTSTileResolutions = {};


    /**
     * Public Method: lonlat2osmtile
     * from http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Zoom_levels
     *
     */
    //Not used but great
    var _lonlat2osmtile = function (lon, lat, zoom) {
        var x = Math.floor((lon+180)/360*Math.pow(2,zoom));
        var y = Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom));
        var osmtile = 'http://tile.openstreetmap.org/' +zoom+'/'+x + '/'+y+'.png';
        return osmtile;
    };

     /**
     * _testConfig
     * @param {xml} config xml to test
     */

    var _testConfiguration = function (conf) {
        var score = 0;
        var nbtests = 3;
        //test doublon name layers
        var test = [];
        var doublons = 0;
        var layers = [];
        conf.themes.theme.forEach(function (theme) {
            if (theme.layer) {
                layers = layers.concat(theme.layer);
            }
            theme.group.forEach(function (group) {
                if (group.layer) {
                    layers = layers.concat(group.layer);
                }
            });
        });
        layers.forEach(function(layer) {
            var name = layer.name;
            if ($.inArray(name, test)) {
                test.push(name);
            } else {
                doublons = 1;
                console.log("doublon " + name + " in layers");
            }
        });

        score+=(doublons === 0);
        //test = 1 baselayer visible
        var test = 0;
        conf.baselayers.baselayer.forEach(function(baselayer) {
            if (baselayer.visible === "true") {
                test += 1;
            }
        });
        if (test === 1) {
            score+=1;
        } else {
            console.log(test + " baselayer(s) visible(s)");
        }

        // test validité sld
        var sld_reg = /^(?:http(s)?:\/\/)?[\w-./@]+.(sld|SLD)$/i;
        var sld_test = 1;
        layers.forEach(function(layer) {
            if (layer.sld) {
                var name = layer.name;
                var slds = layer.sld.split(",");
                slds.forEach(function (sld, i) {
                    if (!sld_reg.test(sld)) {
                        sld_test = 0;
                        console.log("sld " + sld + "\nnon valide pour la couche " + name);
                    }
                });
            }
        });
        score+=sld_test;
        //Résultats tests
        console.log("tests config :" + ((score/nbtests)===1));
    };

    var _initWMTSMatrixsets = function (projection) {
        var projectionExtent = projection.getExtent();
        var size = ol.extent.getWidth(projectionExtent) / 256;
        _WMTSTileMatrix = {'EPSG:3857': [], 'EPSG:4326': [],'EPSG:2154': [],'PM':[]};
        _WMTSTileResolutions = {'EPSG:3857': [], 'EPSG:4326': [],'EPSG:2154': [],'PM':[]};
        for (var z = 0; z < 22; ++z) {
            // generate resolutions and matrixIds arrays for this GEOSERVER WMTS
            _WMTSTileResolutions['EPSG:3857'][z] = size / Math.pow(2, z);
            _WMTSTileMatrix['EPSG:3857'][z] = 'EPSG:3857:' + z;
            _WMTSTileResolutions['EPSG:4326'][z] = size / Math.pow(2, z);
            _WMTSTileMatrix['EPSG:4326'][z] = 'EPSG:4326:' + z;
            _WMTSTileResolutions['EPSG:2154'][z] = size / Math.pow(2, z);
            _WMTSTileMatrix['EPSG:2154'][z] = 'EPSG:2154:' + z;
        }
        for (var z = 0; z < 20; ++z) {
            // generate resolutions and matrixIds arrays for this GEOPORTAIL WMTS
            _WMTSTileResolutions['PM'][z] = size / Math.pow(2, z);
            _WMTSTileMatrix['PM'][z] = z;
        }
    };

    _getWMTSTileMatrix = function (matrixset) {
        return _WMTSTileMatrix[matrixset];
    };

    _getWMTSTileResolutions = function (matrixset) {
        return _WMTSTileResolutions[matrixset];
    };

    return {
        lonlat2osmtile: _lonlat2osmtile,
        testConfiguration: _testConfiguration,
        initWMTSMatrixsets: _initWMTSMatrixsets,
        getWMTSTileMatrix : _getWMTSTileMatrix,
        getWMTSTileResolutions: _getWMTSTileResolutions

    };

})();