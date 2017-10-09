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
            x: -170,
            y: 30
        },
        'hb': {
            scale: 0.75,
            x: -170,
            y: 30
        },
        'rw': {
            scale: 0.75,
            x: -170,
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
    }

    function getAltitudes() {
        return geodata.features[0].geometry.coordinates[0].map(function (point) {
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
            var x = endPoint.x - startPoint.x;
            var y = endPoint.y - startPoint.y;
            var currentX = currentPoint.x - startPoint.x;
            var currentY = currentPoint.y - startPoint.y;
            var cos = x / (Math.sqrt(x * x + y * y));
            var l = currentY - y * currentX / x;
            return Math.abs(l * cos);
        }

        function getPoint(coordinates, savedPoints) {
            if (!coordinates.length) return;
            var startPoint = coordinates[0].point;
            var endPoint = last(coordinates).point;

            var maxPerpendicularLength = 0;
            var savedPoint;
            var number;
            coordinates.forEach(function (point, i) {
                var d = getPerpendicularLength(startPoint, endPoint, point.point);
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

        var px_distance = getTotalLength();
        var step = px_distance / geodata.features[0].geometry.coordinates[0].length;
        var pieces = d3.range(0, px_distance, step);
        pieces.push(px_distance);
        var coordinates = pieces.map(function (piece) {
            return {
                point: getPointAtLength(piece),
                distance: piece
            };
        });

        getPoint(coordinates, savedPoints);
        savedPoints.sort(function (a, b) {
            return a.distance - b.distance;
        });
        return savedPoints;
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