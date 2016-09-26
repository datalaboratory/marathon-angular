angular.module('marathon').directive('altitudeLegend', function ($timeout, $rootScope, mapHelper, track) {
    var render = {
        margin: {
            left: 25,
            right: 25,
            top: 22,
            bottom: 22
        }
    };

    function distanceParams() {
        var distance_in_km = Math.round(track.getTrackLength() / 1000);
        return {
            '42km': {
                marks: [10, distance_in_km / 2, 30]
            },
            '10km': {
                marks: [2, distance_in_km / 2, 7],
                maxPoint: {
                    alt: 169,
                    x: 0.85
                }
            },
            'hb': {
                marks: [10, distance_in_km / 2, 30]

            }
        }
    }

    return {
        restrict: 'E',
        templateUrl: 'directives/altitudeLegend.html',
        replace: true,
        scope: true,
        link: function ($scope, $element) {


            $scope.scaleX = d3.scale.linear();
            $scope.scaleY = d3.scale.linear();
            $scope.scaleXFromDistance = d3.scale.linear();
            $scope.altitudeSizeScales = {
                x: [$scope.scaleX, $scope.scaleXFromDistance],
                y: $scope.scaleY
            };
            $scope.altGraph = {
                pointRadius: 1.5,
                imgSize: 15
            };
            $scope.movingPoint = {};
            $scope.selectedRunnerOnMap = {};
            function formatAltitudePath(alt) {
                var altObjects = alt.map(function (altPoint, i) {
                    return {
                        i: i,
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
                $scope.altGraph.points = [];
                $scope.altGraph.points.push(minAlt, maxAlt);
                var customMaxPoint = distanceParams()[$scope.currentTrackName].maxPoint;
                if (customMaxPoint) {
                    $scope.altGraph.customMaxAlt = {
                        i: customMaxPoint.x * alt.length,
                        alt: customMaxPoint.alt
                    };
                    $scope.altGraph.points.push($scope.altGraph.customMaxAlt);
                } else {
                    delete $scope.altGraph.customMaxAlt
                }
                $scope.altGraph.min = minAlt;
                $scope.altGraph.max = maxAlt;
                $timeout(function () {
                    $scope.$broadcast('render', render);
                });
            }

            $scope.renderAltitudePath = function () {
                if (!$scope.altitudes) return;

                var d3element = this;
                d3element.attr('d', mapHelper.formatPathPoints($scope.altitudes.map(function (altPoint, i) {
                    return {
                        x: $scope.scaleX(i),
                        y: $scope.scaleY(altPoint)
                    }
                })));
            };

            $scope.renderPoint = function () {
                var $scope = angular.element(this.node()).scope();
                if (!$scope.altGraph.points.length) return;
                var d3element = this;
                d3element.select('circle')
                    .attr('cx', $scope.scaleX($scope.point.i))
                    .attr('cy', $scope.scaleY($scope.point.alt))
                    .attr('r', $scope.altGraph.pointRadius);
                d3element.select('text')
                    .attr('x', $scope.scaleX($scope.point.i))
                    .attr('y', function () {
                        if ($scope.point.alt == $scope.altGraph.min.alt) return $scope.scaleY($scope.point.alt) + 12;
                        return $scope.scaleY($scope.point.alt) - 5;
                    })
            };

            var divPosition = $($element[0]).position();

            $scope.moveAltitudePoint = function ($event) {
                var x = $event.originalEvent.layerX - divPosition.left - render.margin.left;
                x = Math.max(x, 0);
                x = Math.min(x, $scope.scaleX.range()[1]);
                var altitudeNumber = Math.round($scope.scaleX.invert(x));
                if (altitudeNumber >= $scope.altitudes.length) altitudeNumber--;
                $scope.altitudePoint.altitude = $scope.altGraph.altitudes[altitudeNumber];
                $scope.altitudePoint.position = track.getPointAtLength(
                    $scope.scaleXFromDistance.invert(x) * 1000 *
                    track.getTotalLength() / track.getTrackLength());

                var y = $scope.scaleY($scope.altitudePoint.altitude);

                $scope.movingPoint.position = {
                    y: y,
                    x: x
                };
            };

            $scope.renderDistanceMark = function () {
                var $scope = angular.element(this.node()).scope();
                if (!$scope.altGraph.distanceMarks) return;
                var d3element = this;
                var x = $scope.scaleXFromDistance($scope.mark);
                d3element.select('line')
                    .attr('x1', x)
                    .attr('x2', x)
                    .attr('y1', $scope.scaleY($scope.altGraph.min.alt) + 10)
                    .attr('y2', $scope.scaleY($scope.altGraph.max.alt) - 5);
                d3element.select('text')
                    .attr('x', x)
                    .attr('y', $scope.scaleY($scope.altGraph.min.alt) + 10)
            };
            
            $scope.renderFlag = function () {
                var $scope = angular.element(this.node()).scope();
                if (!$scope.altGraph.flags) return;
                var d3element = this;
                d3element
                    .attr('x', $scope.scaleX($scope.flag.position) - $scope.altGraph.imgSize / 2)
                    .attr('y', $scope.scaleY($scope.altGraph.altitudes[$scope.flag.position]) - $scope.altGraph.imgSize)
                    .attr('width', $scope.altGraph.imgSize)
                    .attr('height', $scope.altGraph.imgSize)
                    .attr('xlink:href', 'img/mark-' + $scope.flag.image + '.png')
            };
            
            $scope.renderGradient = function () {
                if (!$scope.altGraph.min) return;
                var d3element = this;
                d3element
                    .attr('x1', $scope.scaleX($scope.altGraph.min.i))
                    .attr('x2', $scope.scaleX($scope.altGraph.min.i))
                    .attr('y1', $scope.scaleY($scope.altGraph.min.alt))
            };

            $scope.$on('trackUpdated', function () {
                $timeout(function () {
                    var altitudes = track.getAltitudes();
                    $scope.altitudes = altitudes;

                    var customMaxPoint = distanceParams()[$scope.currentTrackName].maxPoint;
                    if (customMaxPoint) {
                        $scope.scaleY
                            .domain([d3.extent(altitudes)[0], customMaxPoint.alt]);
                    } else {
                        $scope.scaleY
                            .domain(d3.extent(altitudes));
                    }
                    $scope.scaleXFromDistance
                        .domain([0, track.getTrackLength() / 1000])
                        .clamp(true);
                    $scope.scaleX
                        .domain([0, altitudes.length]);
                    $scope.altGraph.altitudes = altitudes;
                    $scope.altGraph.distanceMarks = distanceParams()[$scope.currentTrackName]['marks'];
                    $scope.altGraph.flags = [
                        {position: 0, image: 'yel'},
                        {position: altitudes.length - 1, image: 'red'}
                    ];
                    formatAltitudePath(altitudes);
                });
            });
        }
    };
});