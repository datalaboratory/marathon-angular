angular.module('dataLab').directive('labMargin', function () {
    return {
        restrict: 'A',
        scope: {},
        link: function ($scope, $element) {
            var element = $element[0];
            var d3element = d3.select(element);

            $scope.$on('render', function ($event, render) {
                d3element.attr('transform', 'translate(' + render.margin.left + ',' + render.margin.top + ')')
            })
        }
    }
});