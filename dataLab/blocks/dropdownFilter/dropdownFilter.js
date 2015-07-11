angular.module('dataLab').directive('labDropdownFilter', function ($parse) {
    return {
        restrict: 'E',
        templateUrl: 'dropdownFilter/dropdownFilter.html',
        replace: true,
        scope: {
            config: '='
        },
        link: function link($scope, $element) {
            $scope.$watch('config', function (config) {
                if (!config) return;
                $scope.values = config.values;
                if (angular.isArray($scope.values)) {
                    var values = {};
                    $scope.values.forEach(function (value) {
                        values[value] = value;
                    });
                    $scope.values = values;
                }
                var getModel = $parse(config.model);
                var setModel = getModel.assign;

                $scope.select = function (id) {
                    setModel($scope.$parent, id);
                    $scope.closeList();
                }
            }, true);
            $scope.$parent.$watch($scope.config.model, function (id) {
                $scope.currentId = id;
                if (id == null) {
                    $scope.currentValue = $scope.config.allValues
                } else $scope.currentValue = $scope.values[id];

            });
            $scope.toggleList = function () {
                if ($scope.state == 'open') {
                    $scope.state = 'closed'
                } else $scope.state = 'open';
            };
            $scope.closeList = function () {
                $scope.state = 'closed';
            };
        }
    };
});