angular.module('marathon').factory('track', function ($rootScope) {
    var earth_radius = 6371000;
    var projection = d3.geo.mercator().scale(1).translate([0, 0]);
    var path = d3.geo.path().projection(projection);
    var geodata;
    var START = 0;
    var END = 1;
    var X = 0;
    var Y = 1;
    var width;
    var height;
    var pathData;
    var trackLength;

    var magicNumbers = {
        scale: 0.6,
        x: -130,
        y: 80
    };
    var pathElement = $('<svg><path d="" /></svg>').find('path');

    function updateAll() {
        if (!width || !height || !geodata) return;
        trackLength = d3.geo.length(geodata) * earth_radius;
        var b = path.bounds(geodata);
        var s = magicNumbers.scale / Math.max((b[END][X] - b[START][X]) / width, (b[END][Y] - b[START][Y]) / height);
        var t = [
            (width - s * (b[END][X] + b[START][X])) / 2 + magicNumbers.x,
            (height - s * (b[END][Y] + b[START][Y])) / 2 + magicNumbers.y
        ];
        projection.scale(s).translate(t);
        pathData = path(geodata);
        pathElement.attr('d', pathData);
        $rootScope.$broadcast('trackUpdated');
    }
    function updateContainerSize(w, h){
        width = w;
        height = h;
        updateAll();
    }
    function updateGeodata(data) {
        geodata = data;
        updateAll();
    }
    function getTotalLength() {
        return pathElement[0].getTotalLength();
    }
    function getTrackLength() {
        return trackLength;
    }
    function getPointAtLength(length) {
        return pathElement[0].getPointAtLength(length);
    }
    function getPathData() {
        return pathData;
    }

    return {
        earth_radius: 6371000,
        getTotalLength: getTotalLength,
        getTrackLength: getTrackLength,
        getPointAtLength: getPointAtLength,
        getPathData: getPathData,
        updateContainerSize: updateContainerSize,
        updateGeodata: updateGeodata
    };
});