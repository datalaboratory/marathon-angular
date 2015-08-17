angular.module('marathon').directive('scrollTo', function () {
    return {
        restrict: 'A',
        link: function ($scope, $element) {
            $scope.$on('legendReady', function () {
                   $(document).scrollTop($element.offset().top);
            })
        }
    }
});