angular.module('marathon').directive('legendAltitude', function () {
    return {
        restrict: 'E',
        templateUrl: 'directives/legendAltitude.html',
        replace: true,
        templateNamespace: 'svg',
        link: function ($scope, $element) {
            var width = 246, height = 20, offset_ver = 22, offset_hor = 7;
            var svg = d3.select($element[0]);
            $element.css({
                width: width + 2 * offset_hor,
                height: height + 2 * offset_ver
            });
            var scaleY = d3.scale.linear();
            var scaleX = d3.scale.linear();
            var scaleXFromDistance = d3.scale.linear();

            $scope.sizeScales = {
                x: scaleX,
                y: scaleY
            };
            $scope.track.then(function (data) {
                var geo = data.data;
                var alt = geo.geometry.coordinates.map(function (coord) {
                    return coord[2]
                });
                var distance_type = 42;
                var min_max_alt = d3.extent(alt);

                scaleY
                    .domain([min_max_alt[0], min_max_alt[1]])
                    .range([height + offset_ver, offset_ver]);
                scaleX
                    .domain([0, alt.length])
                    .range([offset_hor, width + offset_hor]);

                var first_point = {x: offset_hor, y: height + offset_ver};

                var data_top = [];
                var max_alt = first_point;
                var min_alt = {x: offset_hor, y: 0};
                alt.forEach(function (coord, i) {
                    var point = {x: scaleX(i), y: scaleY(coord)};
                    if (point.y < max_alt.y) {
                        max_alt = point;
                        max_alt.num = i
                    }
                    if (point.y > min_alt.y) {
                        min_alt = point;
                        min_alt.num = i
                    }

                    data_top.push(point)
                });
                data_top = mh.formatPathPoints(data_top);
                var trackLength = d3.geo.length(geo) * earth_radius;

                var distance_in_km = Math.round(trackLength / 1000), // 21\42\10 и т.п. для рисок на графике
                    distance_marks = (distance_type == 42) ? [10, distance_in_km / 2, 30] : [2, distance_in_km / 2, 7]; // Где будем ставить риски

                scaleXFromDistance
                    .domain([0, distance_in_km])
                    .range([offset_hor, width + offset_hor]);

                $scope.altGraph = {
                    imgSize: 14.5,
                    altitudes: alt,
                    pathData: data_top,
                    pointRadius: 1.5,
                    distanceInKm: distance_in_km,
                    distanceMarks: distance_marks,
                    xFromDistance: scaleXFromDistance,
                    min: min_alt,
                    max: max_alt,
                    x: scaleX,
                    y: scaleY
                };

            })
        }
    };
});