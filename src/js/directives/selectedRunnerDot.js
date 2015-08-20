angular.module('marathon').directive('selectedRunnerDot', function (removePrototype) {
    return {
        restrict: 'E',
        templateNamespace: 'svg',
        replace: true,
        templateUrl: 'directives/selectedRunnerDot.html',
        scope: {
            'paddingX': '=',
            'paddingTop': '=',
            'paddingBottom': '='
        },
        transclude: true,
        link: function ($scope, $element) {
            var $rect = $element.find('rect');

            var bbox = function getBBox() {
                var $text = $element.find('text').not('.ng-hide');
                var text = $text[0];
                return removePrototype(text.getBBox());
            };
            $scope.$watch(bbox, function (box) {
                var paddingX, paddingBottom, paddingTop;
                paddingX = $scope.paddingX || 0;
                paddingTop = $scope.paddingTop || 0;
                paddingBottom = $scope.paddingBottom || 0;
                $rect.attr({
                    x: box.x - paddingX,
                    y: box.y - paddingTop,
                    width: box.width + paddingX * 2,
                    height: box.height + paddingTop + paddingBottom
                });
            }, true);
        }
    };
});