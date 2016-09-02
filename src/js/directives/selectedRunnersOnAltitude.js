angular.module('marathon').directive('selectedRunnersOnAltitude', function (mapHelper, track, $rootScope) {
    var render = {
        margin: {
            left: 20,
            right: 20,
            top: 22,
            bottom: 22
        }
    };
    return {
        restrict: 'E',
        templateUrl: 'directives/selectedRunners.html',
        replace: true,
        templateNamespace: 'svg',
        link: function link($scope, $element) {
            $scope.getRunnerPosition = function (runner) {
                if (!track.getTotalLength()) return;
                var current_distance = mapHelper.getDistanceByRangesAndTime(runner, $scope.time.current * 1);
                current_distance = Math.max(0, current_distance);
                var x = $scope.scaleXFromDistance(current_distance / 1000);
                var altitudeNumber = Math.round($scope.scaleX.invert(x));
                if (altitudeNumber >= $scope.altGraph.altitudes.length) {
                    altitudeNumber = $scope.altGraph.altitudes.length - 1;
                }
                var y = $scope.scaleY($scope.altGraph.altitudes[altitudeNumber]);
                return {
                    x: x,
                    y: y
                };
            };
            $scope.showTooltip = function($event, runner) {
                $scope.selectedRunnerOnMap.runner = runner;
                var runnerPosition = $scope.getRunnerPosition(runner);
                var x = $event.originalEvent.offsetX + runnerPosition.x + render.margin.left - 186;
                var y = $event.originalEvent.offsetY + runnerPosition.y + render.margin.top;

                $scope.selectedRunnerOnMap.position = "left:" + (x + 6) + 'px;top:' + (y + 6) + 'px;';
            };

            $rootScope.$on('startRender', function () {
                $scope.$broadcast('render', render);
            });
            $scope.renderSelectedRunner = function () {
                var d3element = this;
                var $scope = angular.element(d3element.node()).scope();
                var coord = $scope.getRunnerPosition($scope.runner);
                d3element
                    .attr('transform', 'translate(' + coord.x + ',' + coord.y + ')')
            };

        }
    }
});
