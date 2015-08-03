angular.module('marathon').directive('loadingCover', function () {
    var state = {
        map: false,
        marathon: true
    };
    return {
        restrict: 'A',
        link: function ($scope, $element, $attrs) {
            function showCover() {
                state[$attrs.loadingCover] = true;
                $element
                    .removeClass('loader-container--inactive')
                    .addClass('loader-container--active');
            }
            function hideCover() {
                state[$attrs.loadingCover] = false;
                $element
                    .removeClass('loader-container--active')
                    .addClass('loader-container--inactive');
            }
            if (state[$attrs.loadingCover])
                showCover();
            else
                hideCover();
            $scope.$on('showCover:' + $attrs.loadingCover, showCover);
            $scope.$on('hideCover:' + $attrs.loadingCover, hideCover);
        }
    }
});