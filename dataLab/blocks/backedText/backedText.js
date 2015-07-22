angular.module('dataLab').directive('backedText', function(removePrototype) {
    return {
        restrict: 'E',
        templateNamespace: 'svg',
        replace: true,
        templateUrl: 'backedText/backedText.html',
        scope: {
            'paddingX': '=',
            'paddingY': '=',
            'padding': '='
        },
        transclude: true,
        link: function($scope, $element) {
            var $text = $element.find('text');
            var $rect = $element.find('rect');
            var text = $text[0];
            var bbox = function() {
                return removePrototype(text.getBBox());
            };
            $scope.$watch(bbox, function(box) {
                var paddingX, paddingY;
                paddingX = $scope.paddingX || $scope.padding || 0;
                paddingY = $scope.paddingY || $scope.padding || 0;
                $rect.attr({
                    x: box.x - paddingX,
                    y: box.y - paddingY,
                    width: box.width + paddingX * 2,
                    height: box.height + paddingY * 2
                });
            }, true);
        }
    };
});