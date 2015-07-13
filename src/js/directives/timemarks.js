angular.module('marathon').directive('timeMarks', function () {
    return {
        restrict: 'E',
        templateUrl: 'directives/timeMarks.html',
        replace: true,
        link: function link($scope, $element) {
            $scope.timeMarks = [];
            var timeMarksCount = Math.floor($scope.time.maxTime / 3600);
            function getTimeFromDay(sec) {
                return moment($scope.time.start)
                    .add(sec, 'seconds')
                    .utc
                    .format('hh:mm');
            }
            function timeFormat(sec) {
                return moment($scope.time.start)
                    .startOf('day')
                    .add(sec, 'seconds')
                    .utc
                    .format('hh:mm');
            }

        }
    }
});