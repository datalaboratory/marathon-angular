angular.module('marathon').directive('altitudeLegend', function (mapHelper, track, $timeout) {
    var render = {
        margin: {
            left: 7,
            right: 7,
            top: 22,
            bottom: 22
        }
    };

    function distanceParams() {
        var distance_in_km = Math.round(track.getTrackLength() / 1000);
        return {
            '10km': {
                marks: [2, distance_in_km / 2, 7],
                maxPoint: {
                    alt: 169,
                    x: 0.75
                }
            },
            '21km': {
                marks: [5, distance_in_km / 2, 15],
                maxPoint: {
                    alt: 169,
                    x: 0.75
                }
            }
        }
    }

    return {
        restrict: 'E',
        templateUrl: 'directives/altitudeLegend.html',
        replace: true,
        templateNamespace: 'svg',
        link: function ($scope) {
            $scope.scaleX = d3.scale.linear();
            $scope.scaleY = d3.scale.linear();
            $scope.scaleXFromDistance = d3.scale.linear();
            $scope.altitudeSizeScales = {
                x: [$scope.scaleX, $scope.scaleXFromDistance],
                y: $scope.scaleY
            };
            $scope.altGraph = {};
            $scope.altGraph.pointRadius = 1.5;
            $scope.altGraph.imgSize = 15;

            function formatAltitudePath(alt) {
                var altObjects = alt.map(function (altPoint, i) {
                    return {
                        y: $scope.scaleY(altPoint),
                        x: $scope.scaleX(i),
                        num: i,
                        alt: altPoint
                    }
                });
                var minAlt = altObjects.reduce(function (a, b) {
                    if (b.alt < a.alt) return b;
                    return a
                });

                var maxAlt = altObjects.reduce(function (a, b) {
                    if (b.alt > a.alt) return b;
                    return a
                });
                var customMaxPoint = distanceParams()[$scope.currentTrackName].maxPoint;
                if (customMaxPoint) {
                    $scope.altGraph.customMaxAlt = {
                        x: $scope.scaleXFromDistance(customMaxPoint.x * track.getTrackLength() / 1000),
                        y: $scope.scaleY(customMaxPoint.alt),
                        alt: customMaxPoint.alt
                    }
                } else {
                    delete $scope.altGraph.customMaxAlt
                }
                $scope.altGraph.pathData = mapHelper.formatPathPoints(altObjects);
                $scope.altGraph.min = minAlt;
                $scope.altGraph.max = maxAlt;
            }

            $scope.$on('startRender', function () {
                $scope.$broadcast('render', render);
            });
            $scope.$on('trackUpdated', function () {
                $timeout(function () {
                    var altitudes = track.getAltitudes();
                    var distance_in_km = Math.round(track.getTrackLength() / 1000); // 21\42\10 и т.п. для рисок на графике

                    var customMaxPoint = distanceParams()[$scope.currentTrackName].maxPoint;
                    if (customMaxPoint) {
                        $scope.scaleY
                            .domain([d3.extent(altitudes)[0], customMaxPoint.alt]);
                    } else {
                        $scope.scaleY
                            .domain(d3.extent(altitudes));
                    }
                    $scope.scaleXFromDistance
                        .domain([0, distance_in_km]);
                    $scope.scaleX
                        .domain([0, altitudes.length]);
                    $scope.altGraph.altitudes = altitudes;
                    $scope.altGraph.distanceInKm = distance_in_km;
                    $scope.altGraph.distanceMarks = distanceParams()[$scope.currentTrackName]['marks'];
                    formatAltitudePath(altitudes);
                });
            });
        }
    };
});