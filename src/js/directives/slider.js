angular.module('marathon').directive('slider', function ($document) {
    return {
        restrict: 'E',
        templateUrl: 'directives/slider.html',
        replace: true,
        link: function link($scope, $element) {
            var startX = $scope.timeScale($scope.time.current), x = startX, minX = 0, maxX = $element.parent().width();
            $scope.$watch('timeScale.domain()', function () {
                startX = $scope.timeScale($scope.time.current); x = startX;
                setTime(startX);
            }, true);
            $element.on('mousedown', function (event) {
                event.preventDefault();
                startX = event.screenX - x;
                $document.on('mousemove', mousemove);
                $document.on('mouseup', mouseup);
            });
            function mousemove(event) {
                x = event.screenX - startX;
                if (x < minX) {
                    x = minX;
                }
                if (x > maxX) {
                    x = maxX;
                }
                setTime(x);
                $scope.$apply();
            }

            function mouseup() {
                $document.off('mousemove', mousemove);
                $document.off('mouseup', mouseup)
            }

            function setTime(x) {
                if (!$scope.time) return;
                var time = $scope.timeScale.invert(x);
                $scope.time.current = moment(time);
                $scope.selectedTime = moment(time).subtract($scope.time.start).format('HH:mm');
                $element.css({left: x + 'px'})
            }
        }
    }
});