angular.module('marathon').directive('selectedRunners', function (mapHelper, track) {
    return {
        restrict: 'E',
        templateUrl: 'directives/selectedRunners.html',
        replace: true,
        templateNamespace: 'svg',
        link: function link($scope) {
            $scope.getRunnerPosition = function (runner) {
                if (!track.getTotalLength()) return;
                var px_total_length = track.getTotalLength();
                var current_distance = mapHelper.getDistanceByRangesAndTime(runner, $scope.time.current * 1);
                current_distance = Math.max(0, current_distance);
                var px_current_length = current_distance * px_total_length / track.getTrackLength();
                var cur_coord = track.getPointAtLength(px_current_length);
                return {
                    x: cur_coord.x,
                    y: cur_coord.y
                };
            };
            $scope.getScale = function () {
                var scale = mapHelper.getMapScale();
                if (scale) return 1 / scale;
                return 1;
            };
            $scope.showTooltip = function($event, runner) {
                $scope.selectedRunnerOnMap.runner = runner;
                $scope.selectedRunnerOnMap.position = "left:" + ($event.offsetX + 6) + 'px;top:' + ($event.offsetY + 6) + 'px;';
            }
        }
    }
});
