angular.module('marathon').directive('altitudeLegend', function ($timeout, $rootScope, mapHelper, track) {
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
        scope: true,
        link: function ($scope) {
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

            function formatAltitudePath(alt) {
                var altObjects = alt.map(function (altPoint, i) {
                    return {
                        y: $scope.scaleY(altPoint),
                        x: $scope.scaleX(i),
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
                        x: $scope.scaleXFromDistance(customMaxPoint.x * track.getTrackLength() / 1000),
                        y: $scope.scaleY(customMaxPoint.alt),
                        alt: customMaxPoint.alt
                    };
                    $scope.altGraph.points.push($scope.altGraph.customMaxAlt);
                } else {
                    delete $scope.altGraph.customMaxAlt
                }
                $scope.altGraph.pathData = mapHelper.formatPathPoints(altObjects);
                $scope.altGraph.min = minAlt;
                $scope.altGraph.max = maxAlt;
                $timeout(function () {
                    $scope.$broadcast('render', render);
                });
            }

            $scope.renderAltitudePath = function () {
                if (!$scope.altGraph.pathData) return;
                var d3element = d3.select(this);
                d3element.attr('d', $scope.altGraph.pathData);
            };

            $scope.renderPoint = function () {
                var $scope = angular.element(this).scope();
                if (!$scope.altGraph.points.length) return;
                var d3element = d3.select(this);
                d3element.select('circle')
                    .attr('cx', $scope.point.x)
                    .attr('cy', $scope.point.y)
                    .attr('r', $scope.altGraph.pointRadius);
                d3element.select('text')
                    .attr('x', $scope.point.x)
                    .attr('y', function () {
                        if ($scope.point.alt == $scope.altGraph.min.alt) return $scope.point.y + 12;
                        return $scope.point.y - 5;
                    })
            };

            $scope.renderDistanceMark = function () {
                var $scope = angular.element(this).scope();
                if (!$scope.altGraph.distanceMarks) return;
                var d3element = d3.select(this);
                d3element.select('line')
                    .attr('x1', $scope.scaleXFromDistance($scope.mark))
                    .attr('x2', $scope.scaleXFromDistance($scope.mark))
                    .attr('y1', $scope.altGraph.min.y + 10)
                    .attr('y2', $scope.altGraph.max.y - 5);
                d3element.select('text')
                    .attr('x', $scope.scaleXFromDistance($scope.mark))
                    .attr('y', $scope.altGraph.min.y + 10)
            };
            
            $scope.renderFlag = function () {
                var $scope = angular.element(this).scope();
                if (!$scope.altGraph.flags) return;
                var d3element = d3.select(this);
                d3element
                    .attr('x', $scope.scaleX($scope.flag.position) - $scope.altGraph.imgSize / 2)
                    .attr('y', $scope.scaleY($scope.altGraph.altitudes[$scope.flag.position]) - $scope.altGraph.imgSize)
                    .attr('width', $scope.altGraph.imgSize)
                    .attr('height', $scope.altGraph.imgSize)
                    .attr('xlink:href', 'img/mark-' + $scope.flag.image + '.png')
            };
            
            $scope.renderGradient = function () {
                if (!$scope.altGraph.min) return;
                var d3element = d3.select(this);
                d3element
                    .attr('x1', $scope.altGraph.min.x)
                    .attr('x2', $scope.altGraph.min.x)
                    .attr('y1', $scope.altGraph.min.y)
            };

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