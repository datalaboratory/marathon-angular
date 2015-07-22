angular.module('dataLab').directive('bottomLine', function(removePrototype) {
    return {
        restrict: 'E',
        templateNamespace: 'svg',
        replace: true,
        templateUrl: 'bottomLine/bottomLine.html',
        scope: {
            stroke: '=',
            offset: '='
        },
        transclude: true,
        link: function($scope, $element) {
            var $text = $element.find('text');
            var $line = $element.find('line');
            var $svg = $element.parents('svg').first();
            var text = $text[0];
            var bbox = function() {
                return removePrototype(text.getBBox());
            };
            $scope.$watch(bbox, function(box) {
                $line.attr({
                    x1: box.x,
                    y1: box.y + box.height + $scope.offset,
                    x2: box.x,
                    y2: $svg.height()
                });
            }, true);
        }
    };
});