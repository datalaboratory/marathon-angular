angular.module('marathon').directive('finishTimeLine', function () {
    return {
        restrict: 'E',
        templateUrl: 'directives/finishTimeLine.html',
        templateNamespace: 'svg',
        replace: true,
        link: function link($scope, $element) {
            var width = $element.parent().width();
            function updateWidth(time) {
                var currentWidth = $scope.timeScale(time) - 25;
                if (currentWidth < 0) currentWidth = 0;
                $scope.currentWidth = currentWidth;
            }
            $scope.$watch('time.current', function (time) {
                updateWidth(time)
            });
            $scope.$watch('timeScale.domain()', function () {
                updateWidth($scope.time.current);
                var timeMarksCount = Math.ceil($scope.time.maxTime / 1200);
                var tickTimes = [];
                for (var i = 0; i < timeMarksCount; i++) {
                    var mark = moment($scope.time.start).add(20 * i, 'm');
                    tickTimes.push(mark);
                }
                tickTimes.push(moment($scope.time.start + $scope.time.maxTime * 1000));
                $scope.tickTimes = tickTimes;
            }, true);


        }
    }
});