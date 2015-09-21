angular.module('marathon').factory('track', function ($rootScope, last) {
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
    var currentTrackName = '42km';
    var simplifiedPoints;

    var magicNumbers = {
        '42km': {
            scale: 0.75,
            x: -120,
            y: 30
        },
        'hb': {
            scale: 0.75,
            x: -120,
            y: 30
        },
        '10km': {
            scale: 0.6,
            x: -130,
            y: 60
        }
    };
    var calculatedMagicNumbers = {};

    var pathElement = $('<svg><path d="" /></svg>').find('path');

    function updateAll() {
        if (!width || !height || !geodata) return;
        trackLength = d3.geo.length(geodata) * earth_radius;
        projection = d3.geo.mercator().scale(1).translate([0, 0]);
        path = d3.geo.path().projection(projection);
        var b = path.bounds(geodata);
        var s = magicNumbers[currentTrackName].scale / Math.max((b[END][X] - b[START][X]) / width, (b[END][Y] - b[START][Y]) / height);
        var t = [
            (width - s * (b[END][X] + b[START][X])) / 2 + magicNumbers[currentTrackName].x,
            (height - s * (b[END][Y] + b[START][Y])) / 2 + magicNumbers[currentTrackName].y
        ];
        calculatedMagicNumbers.s = s;
        calculatedMagicNumbers.t = t;


        projection.scale(calculatedMagicNumbers.s).translate(calculatedMagicNumbers.t);
        pathData = path(geodata);
        pathElement.attr('d', pathData);
        simplifiedPoints = calculateSimplifiedPoints();
    }

    function updateContainerSize(w, h) {
        width = w;
        height = h;
        updateAll();
    }

    function updateGeodata(data, trackName) {
        geodata = data;
        currentTrackName = trackName;
        updateAll();
        $rootScope.$broadcast('trackUpdated');
        console.log('trackUpdated')
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

    function calculateSimplifiedPoints() {
        var maxDelta = 1;
        var savedPoints = [];
        var element = $('<svg><path d="" /></svg>').find('path');

        function getPerpendicularLength(startPoint, endPoint, currentPoint) {
            var x = endPoint[0] - startPoint[0];
            var y = endPoint[1] - startPoint[1];
            var currentX = currentPoint[0] - startPoint[0];
            var currentY = currentPoint[1] - startPoint[1];
            var cos = x / (Math.sqrt(x * x + y * y));
            var l = currentY - y * currentX / x;
            return Math.abs(l * cos);
        }

        function getPoint(coordinates, savedPoints) {
            var startPoint = coordinates[0];
            var endPoint = last(coordinates);

            var maxPerpendicularLength = 0;
            var savedPoint;
            var number;
            coordinates.forEach(function (point, i) {
                var d = getPerpendicularLength(projection(startPoint), projection(endPoint), projection(point));
                if (d > maxPerpendicularLength) {
                    maxPerpendicularLength = d;
                    savedPoint = point;
                    number = i
                }
            });
            if (maxPerpendicularLength >= maxDelta) {
                savedPoints.push(savedPoint);
                getPoint(coordinates.slice(1, number), savedPoints);
                getPoint(coordinates.slice(number), savedPoints);
            }
        }

        var coordinates = geodata.geometry.coordinates.map(function (point, i) {
            point.push(i);
            return point;
        });
        getPoint(coordinates, savedPoints);
        savedPoints.sort(function (a, b) {
            return last(b) - last(a);
        });
        return savedPoints.map(projection);
    }

    function getSimplifiedPoints() {
        return simplifiedPoints;
    }

    return {
        earth_radius: 6371000,
        getTotalLength: getTotalLength,
        getTrackLength: getTrackLength,
        getPointAtLength: getPointAtLength,
        getPathData: getPathData,
        getProjectedPoint: getProjectedPoint,
        getAltitudes: getAltitudes,
        getSimplifiedPoints: getSimplifiedPoints,
        updateContainerSize: updateContainerSize,
        updateGeodata: updateGeodata
    };
});