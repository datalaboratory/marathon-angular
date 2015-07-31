angular.module('marathon').directive('loadingCover', function () {
    var state = {
        map: false,
        marathon: true
    };
    return {
        restrict: 'A',
        link: function ($scope, $element, $attrs) {
            if (state[$attrs.loadingCover] == true) {
                $element
                    .removeClass('loader-container--inactive')
                    .addClass('loader-container--active');
            } else {
                $element
                    .removeClass('loader-container--active')
                    .addClass('loader-container--inactive');
            }
            $scope.$on('showCover:' + $attrs.loadingCover, function () {
                state[$attrs.loadingCover] = true;
                $element
                    .removeClass('loader-container--inactive')
                    .addClass('loader-container--active');
            });
            $scope.$on('hideCover:' + $attrs.loadingCover, function () {
                state[$attrs.loadingCover] = false;
                $element
                    .removeClass('loader-container--active')
                    .addClass('loader-container--inactive');
            });
        }
    }
});