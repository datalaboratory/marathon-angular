angular.module('marathon').factory('track', function ($rootScope) {
    var earth_radius = 6371000;
    var projection;
    var path;
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
        scale: 0.5,
        x: -130,
        y: 70
    };
    var calculatedMagicNumbers = {};

    var pathElement = $('<svg><path d="" /></svg>').find('path');

    function updateAll() {
        if (!width || !height || !geodata) return;
        trackLength = d3.geo.length(geodata) * earth_radius;
        projection = d3.geo.mercator().scale(1).translate([0, 0]);
        path = d3.geo.path().projection(projection);
        if (!calculatedMagicNumbers.s) {
            var b = path.bounds(geodata);
            var s = magicNumbers.scale / Math.max((b[END][X] - b[START][X]) / width, (b[END][Y] - b[START][Y]) / height);
            var t = [
                (width - s * (b[END][X] + b[START][X])) / 2 + magicNumbers.x,
                (height - s * (b[END][Y] + b[START][Y])) / 2 + magicNumbers.y
            ];
            calculatedMagicNumbers.s = s;
            calculatedMagicNumbers.t = t;
        }

        projection.scale(calculatedMagicNumbers.s).translate(calculatedMagicNumbers.t);
        pathData = path(geodata);
        pathElement.attr('d', pathData);
    }

    function updateContainerSize(w, h) {
        width = w;
        height = h;
        updateAll();
    }

    function updateGeodata(data) {
        geodata = data;
        updateAll();
        $rootScope.$broadcast('trackUpdated');
    }

    function getAltitudes() {
        return geodata.geometry.coordinates.map(function (point) {
            return point[2]
        })
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

    function getProjectedPoint(latlon) {
        return projection(latlon)
    }

    return {
        earth_radius: 6371000,
        getTotalLength: getTotalLength,
        getTrackLength: getTrackLength,
        getPointAtLength: getPointAtLength,
        getPathData: getPathData,
        getProjectedPoint: getProjectedPoint,
        getAltitudes: getAltitudes,
        updateContainerSize: updateContainerSize,
        updateGeodata: updateGeodata
    };
});