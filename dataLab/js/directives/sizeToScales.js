angular.module('dataLab').directive('labSizeToScales', function () {
    return {
        restrict: 'A',
        scope: {
            scales: '=labSizeToScales'
        },
        link: function ($scope, $element) {
            var element = $element[0];

            $scope.$on('render', function ($event, render) {
                var width = element.clientWidth - render.margin.left - render.margin.right;
                var height = element.clientHeight - render.margin.top - render.margin.bottom;
                var setWidth = function (scale) {
                    scale.range([0, width]);
                };
                var setHeight = function (scale) {
                    scale.range([height, 0]);
                };

                if ($scope.scales.x) {
                    if (angular.isArray($scope.scales.x))
                        $scope.scales.x.forEach(setWidth);
                    else
                        setWidth($scope.scales.x);
                }

                if ($scope.scales.y) {
                    if (angular.isArray($scope.scales.y))
                        $scope.scales.y.forEach(setHeight);
                    else
                        setHeight($scope.scales.y);
                }
            })
        }
    }
});