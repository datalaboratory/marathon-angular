angular.module('marathon').directive('slider', function ($document, $interval, $timeout) {
    var played = false;
    return {
        restrict: 'E',
        templateUrl: 'directives/slider.html',
        replace: true,
        link: function link($scope, $element) {
            var element = $element[0];
            var d3element = d3.select(element);
            var render = {
                transition: {
                    duration: 5000
                }
            };

            var startX = $scope.timeScale($scope.time.current);
            var x = startX;
            var minX = 0;
            var maxX = $element.parent().width();
            $scope.$watch('timeScale.domain()', function () {
                startX = $scope.timeScale($scope.time.current);
                x = startX;
                setTimeFromPx(startX);
            }, true);
            $scope.$watch('timeScale.range()', function () {
                maxX = $element.parent().width();
                startX = $scope.timeScale($scope.time.current);
                x = startX;
                setTimeFromPx(startX);
            }, true);
            function mousedown(event) {
                event.preventDefault();
                startX = event.screenX - x;
                $document.on('mousemove', mousemove);
                $document.on('mouseup', mouseup);
            }
            $element.on('mousedown', mousedown);
            function mousemove(event) {
                x = event.screenX - startX;
                if (x < minX) {
                    x = minX;
                }
                if (x > maxX) {
                    x = maxX;
                }
                setTimeFromPx(x);
                $scope.$apply();
            }

            function mouseup() {
                $document.off('mousemove', mousemove);
                $document.off('mouseup', mouseup)
            }

            function setTimeFromPx(x) {
                if (!$scope.time) return;
                var time = $scope.timeScale.invert(x);
                $scope.time.current = moment(time);
                $scope.selectedTime = moment(time).subtract($scope.time.start).format('HH:mm');
                $scope.sliderLeft = x;
                $scope.$emit('renderRequired');
            }

            function setTimeFromTime(time) {
                x = $scope.timeScale(time);
                $scope.time.current = moment(time);
                $scope.selectedTime = moment(time).subtract($scope.time.start).format('HH:mm');
                $scope.sliderLeft = x;
                $scope.$emit('renderRequired');
            }

            $scope.$on('legendReady', function () {
                if (played) return;
                played = true;
                var stopTime = moment($scope.time.current).add(9, 'minute');

                var ticks = $interval(tick, 50);
                function tick() {
                    setTimeFromTime($scope.time.current);
                    $scope.time.current.add(30, 'second');

                    if ($scope.time.current >= stopTime) {
                        $interval.cancel(ticks);
                    }
                }
            });

            $scope.$on('render', function () {
                $element.css({left: x + 'px'})
            })
        }
    }
});