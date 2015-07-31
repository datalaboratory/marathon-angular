angular.module('marathon').directive('snakeRiseLegend', function (mapHelper, track, roundTo, $timeout, $rootScope) {
    var round = roundTo(10);
    return {
        restrict: 'E',
        templateUrl: 'directives/snakeRiseLegend.html',
        replace: true,
        link: function ($scope) {
            var width = 77;
            var dots_on_distance;
            var ratio = 2;
            var step_for_dots = ratio * 1000; // шаг на дистанции с которым смотрим высоту змея
            var section_with_max_height;
            var maxHeight;
            var maxCount;
            var heightScale = d3.scale.linear();

            function updateMaxHeight() {
                var timeStamps = d3.range($scope.time.start, $scope.time.start + $scope.time.maxTime * 1000, 60000);
                section_with_max_height = timeStamps.map(function (time) {
                    return getMaxSnakeHeight(time, $scope.runnersData.items)
                }).reduce(function (a, b) {
                    if (a.height > b.height) return a;
                    return b
                });
                maxHeight = section_with_max_height.height;
                maxCount = (section_with_max_height.runners.male + section_with_max_height.runners.female) / ratio;
                heightScale
                    .domain([0, maxCount])
                    .range([maxHeight, 0]);
                updateSnakes();
                $rootScope.$broadcast('hideCover:marathon');
                $rootScope.$broadcast('hideCover:map');
            }

            $scope.$on('trackUpdated', function(){
                $timeout(updateMaxHeight);
            });
            $scope.$watch('time.current', updateSnakes);
            $scope.$watch('filterValues', updateSnakes, true);

            function getMaxSnakeHeight(time, runners) {
                dots_on_distance = d3.range(0, track.getTrackLength(), step_for_dots);
                return dots_on_distance.map(function (dot) {
                    return mapHelper.getStepHeight(
                        dot,
                        time,
                        runners,
                        step_for_dots);
                }).reduce(function (a, b) {
                    if (a.height > b.height) return a;
                    return b
                });
            }

            function updateSnakes() {
                if (!track.getTrackLength()) return;
                if (isNaN(maxHeight)) return;
                if (!section_with_max_height) return;
                section_with_max_height = getMaxSnakeHeight($scope.time.current, $scope.filteredRunners);
                var countMale = round(section_with_max_height.runners.male / ratio);
                var countFemale = round(section_with_max_height.runners.female / ratio);
                var malePosition = (countFemale) ? Math.min(
                    heightScale(countFemale + countMale / 2),
                    (heightScale(countFemale / 2) - 10)
                ) : heightScale(countMale / 2);
                var femalePercent = section_with_max_height.runners.female / (section_with_max_height.runners.female + section_with_max_height.runners.male)
                if (!femalePercent) femalePercent = 0;
                $scope.snake = {
                    path: {
                        male: formatSnakePath(width, section_with_max_height.height, 1),
                        female: formatSnakePath(width, section_with_max_height.height, femalePercent),
                        all: formatSnakePath(width, maxHeight, 1)
                    },
                    maxHeight: maxHeight,
                    width: width,
                    count: {
                        male: countMale,
                        female: countFemale,
                        all: countMale + countFemale,
                        max: round(maxCount)
                    },
                    countPosition: {
                        male: malePosition,
                        female: heightScale(countFemale / 2)
                    }
                };
            }

            function formatSnakePath(width, height, factor) {
                return 'M0 ' + maxHeight +
                    'L' + width + ' ' + maxHeight +
                    'L' + width + ' ' + (maxHeight - height * factor) +
                    ' C' + width / 2 + ' ' + (maxHeight - height * factor + height * factor / 5) + ' ' +
                    ( width / 2) + ' ' + (maxHeight - 1 * height * factor / 20) +
                    ' 0 ' + maxHeight + ' Z'
            }
        }
    }
});