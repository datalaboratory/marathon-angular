angular.module('marathon').directive('slider', function ($document) {
    return {
        restrict: 'E',
        templateUrl: 'directives/slider.html',
        replace: true,
        link: function link($scope, $element) {
            var startX = 0, x = 0, minX = 0, maxX = $element.parent().width();
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
                $element.css({left: x});
                $scope.$apply();
            }

            function mouseup() {
                $document.off('mousemove', mousemove);
                $document.off('mouseup', mouseup)
            }

            var timeFormat = d3.format('02f');
            $scope.selectedTime = '00:00';
            function setTime(x) {
                if (!$scope.time) return;
                var time = Math.round(x / maxX * $scope.time.finish);
                $scope.time.current = time;
                $scope.selectedTime = timeFormat(Math.floor(time / 3600)) + ':' + timeFormat(Math.floor((time % 3600) / 60) )
            }
        }
    }
});