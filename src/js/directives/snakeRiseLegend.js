angular.module('marathon').directive('snakeRiseLegend', function (mapHelper, track, roundTo, $timeout, $rootScope) {
    var round = roundTo(10);
    var cache = {};
    return {
        restrict: 'E',
        templateUrl: 'directives/snakeRiseLegend.html',
        replace: true,
        link: function ($scope) {
            var width = 77;
            var ratio = 2;
            var step_for_dots = ratio * 1000; // шаг на дистанции с которым смотрим высоту змея
            var maxHeight;
            var maxCount;
            var heightScale = d3.scale.linear();

            function updateMaxHeight() {
                var cached = cache[$scope.currentTrackName];
                if (cached) {
                    maxHeight = cached.height;
                    maxCount = cached.count;
                } else {
                    var timeStamps = d3.range($scope.time.start, $scope.time.start + $scope.time.maxTime * 1000, 60000);
                    var section_with_max_height = timeStamps.map(function (time) {
                        return getMaxSnakeHeight(time, $scope.runnersData.items)
                    }).reduce(function (a, b) {
                        if (a.height > b.height) return a;
                        return b
                    });
                    maxHeight = section_with_max_height.height;
                    maxCount = (section_with_max_height.runners.male + section_with_max_height.runners.female) / ratio;
                    cache[$scope.currentTrackName] = {
                        height: maxHeight,
                        count: maxCount
                    };
                }
                heightScale
                    .domain([0, maxCount])
                    .range([maxHeight, 0]);
                updateSnakes();
                $rootScope.$broadcast('legendReady');
            }

            $scope.$on('trackUpdated', function(){
                $timeout(updateMaxHeight);
            });
            $scope.$watch('time.current', updateSnakes);
            $scope.$watch('filterValues', updateSnakes, true);

            function getMaxSnakeHeight(time, runners) {
                var dots_on_distance = d3.range(0, track.getTrackLength(), step_for_dots);
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
                var maxHeightSection = getMaxSnakeHeight($scope.time.current, $scope.filteredRunners);
                var countMale = round(maxHeightSection.runners.male / ratio);
                var countFemale = round(maxHeightSection.runners.female / ratio);
                var malePosition = countFemale ? Math.min(
                    heightScale(countFemale + countMale / 2),
                    (heightScale(countFemale / 2) - 10)
                ) : heightScale(countMale / 2);
                var femalePercent = maxHeightSection.runners.female / (maxHeightSection.runners.female + maxHeightSection.runners.male)
                if (!femalePercent) femalePercent = 0;
                $scope.snake = {
                    path: {
                        male: formatSnakePath(width, maxHeightSection.height, 1),
                        female: formatSnakePath(width, maxHeightSection.height, femalePercent),
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
                    ' C' + width / 2 + ' ' + (maxHeight - height * factor * .8) + ' ' +
                    (width / 2) + ' ' + (maxHeight - height * factor / 20) +
                    ' 0 ' + maxHeight + ' Z'
            }
        }
    }
});