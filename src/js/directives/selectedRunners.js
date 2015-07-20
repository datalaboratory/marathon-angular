angular.module('marathon').directive('selectedRunners', function () {
    return {
        restrict: 'E',
        templateUrl: 'directives/selectedRunners.html',
        replace: true,
        templateNamespace: 'svg',
        link: function link($scope) {
            var path_node = $scope.trackPath.node();
            var px_total_length = path_node.getTotalLength();
            $scope.getRunnerPosition = function (runner) {
                var current_distance = mh.getDistanceByRangesAndTime(runner, $scope.time.current * 1);
                current_distance = Math.max(0, current_distance);
                var px_current_length = current_distance * px_total_length / $scope.trackLength;
                var cur_coord = path_node.getPointAtLength(px_current_length);
                return {
                    x: cur_coord.x,
                    y: cur_coord.y
                };
            };
            $scope.showTooltip = function($event, runner) {
                $scope.selectedRunnerOnMap.runner = runner;
                $scope.selectedRunnerOnMap.position = "left:" + ($event.offsetX + 6) + 'px;top:' + ($event.offsetY + 6) + 'px;';
            }
        }
    }
});