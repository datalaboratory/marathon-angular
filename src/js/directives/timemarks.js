angular.module('marathon').directive('timeMarks', function () {
    return {
        restrict: 'E',
        templateUrl: 'directives/timeMarks.html',
        replace: true,
        link: function link($scope) {
            $scope.$watch('timeScale.domain()', function () {
                $scope.timeMarks = [];
                var timeMarksCount = Math.ceil($scope.time.maxTime / 3600);
                for (var i = 0; i < timeMarksCount; i++) {
                    var mark = moment($scope.time.start).add(i, 'h').toDate();
                    $scope.timeMarks.push(mark);
                }
                var lastMark = moment($scope.time.start).add($scope.time.maxTime, 's').toDate();
                $scope.timeMarks.push(lastMark);
            }, true);
        }
    }
});