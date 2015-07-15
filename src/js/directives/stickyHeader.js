angular.module('marathon').directive('stickyHeader', function ($document) {
    return {
        restrict: 'E',
        templateUrl: 'directives/stickyHeader.html',
        transclude: true,
        replace: true,
        link: function link($scope, $element) {
            var $inner = $element.find('.sticky-header__inner');
            $document.on('scroll', function(){
                var elementTop = $element[0].offsetTop;
                if (window.scrollY >= elementTop) {
                    $inner.addClass('sticky-header__inner--sticked');
                } else {
                    $inner.removeClass('sticky-header__inner--sticked');
                }
            });
        }
    }
});