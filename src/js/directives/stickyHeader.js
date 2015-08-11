angular.module('marathon').directive('stickyHeader', function ($rootScope, $document) {
    return {
        restrict: 'E',
        templateUrl: 'directives/stickyHeader.html',
        transclude: true,
        replace: true,
        link: function link($scope, $element) {
            var element = $element[0];
            var $inner = $element.find('.sticky-header__inner');
            var sticked = false;
            $document.on('scroll', function(){

                var elementTop = $element.offset().top;
                var elementLeft = element.offsetParent.offsetLeft;
                if (window.scrollY >= elementTop) {
                    if (!sticked) $inner.addClass('sticky-header__inner--sticked');
                    sticked = true;
                } else {
                    if (sticked) $inner.removeClass('sticky-header__inner--sticked');
                    sticked = false;
                }
                $inner.css({
                    left: -window.scrollX + elementLeft
                });
            });
            $rootScope.$on('startRender', function () {
                var elementLeft = element.offsetParent.offsetLeft;
                $inner.css({
                    left: -window.scrollX + elementLeft
                });
            })
        }
    }
});