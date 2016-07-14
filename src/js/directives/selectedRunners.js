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
                var x = $event.originalEvent.layerX || $event.offsetX;
                var y = $event.originalEvent.layerY || $event.offsetY;
                $scope.selectedRunnerOnMap.position = "left:" + (x + 6) + 'px;top:' + (y + 6) + 'px;';
            };

            $scope.renderSelectedRunner = function () {
                var d3element = this;
                var $scope = angular.element(this.node()).scope();
                var coord = $scope.getRunnerPosition($scope.runner);
                var scale = $scope.getScale();
                d3element
                    .attr('transform', 'translate(' + coord.x + ',' + coord.y + ') scale(' + scale + ')')
            };

            /*var unbindStartRender = $rootScope.$on('startRender', function () {
                $scope.$broadcast('render', render);
            });
            $scope.$on('$destroy', function () {
                unbindStartRender();
            });*/
        }
    }
});
