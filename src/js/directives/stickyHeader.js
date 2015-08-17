angular.module('marathon').directive('stickyHeader', function ($rootScope, $document) {
    return {
        restrict: 'E',
        templateUrl: 'directives/stickyHeader.html',
        transclude: true,
        replace: true,
        link: function link($scope, $element) {
            var element = $element[0];
            var $inner = $element.find('.sticky-header__inner');
            var $elementParent = $element.parent();
            var sticked = false;
            $document.on('scroll', function() {
                var elementParentBottom = $elementParent.offset().top + $elementParent.height();
                var elementTop = $element.offset().top;
                var elementBottom = window.scrollY + $inner.height();
                var elementLeft = element.offsetParent.offsetLeft;
                if (window.scrollY >= elementTop) {
                    if (!sticked) {
                        sticked = true;
                    }
                    if (elementParentBottom <= elementBottom) {
                        $inner
                            .removeClass('sticky-header__inner--sticked')
                            .addClass('sticky-header__inner--sticked-to-bottom');
                        $inner.css({
                            top: ($elementParent.height() - $inner.height()) + 'px',
                            left: 0
                        });
                    } else {
                        $inner
                            .removeClass('sticky-header__inner--sticked-to-bottom')
                            .addClass('sticky-header__inner--sticked');
                        $inner.css({
                            top: 0,
                            left: (-window.scrollX + elementLeft) + 'px'
                        });
                    }
                } else {
                    if (sticked) $inner
                        .removeClass('sticky-header__inner--sticked-to-bottom')
                        .removeClass('sticky-header__inner--sticked');
                    sticked = false;
                    $inner.css({
                        left: (-window.scrollX + elementLeft) + 'px'
                    });
                }
            });
            $rootScope.$on('startRender', function () {
                var elementLeft = element.offsetParent.offsetLeft;
                $inner.css({
                    left: (-window.scrollX + elementLeft) + 'px'
                });
            })
        }
    }
});