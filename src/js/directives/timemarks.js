angular.module('marathon').directive('timeMarks', function () {
    return {
        restrict: 'E',
        templateUrl: 'directives/timeMarks.html',
        replace: true,
        link: function link($scope, $element) {
            $scope.timeMarks = [];
            var timeMarksCount = Math.ceil($scope.time.maxTime / 3600);
            for (var i = 0; i < timeMarksCount; i++) {
                var mark = moment($scope.time.start).add(i, 'h').toDate();
                $scope.timeMarks.push(mark);
            }
            $scope.timeMarks.push(moment($scope.time.start).add($scope.time.maxTime, 's').toDate());

            function getTimeFromDay(sec) {
                return moment($scope.time.start)
                    .add(sec, 'seconds')
                    .format('hh:mm');
            }
            function timeFormat(sec) {
                return moment($scope.time.start)
                    .startOf('day')
                    .add(sec, 'seconds')
                    .format('hh:mm');
            }

        }
    }
});