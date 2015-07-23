angular.module('dataLab').constant('roundTo', function (precision) {
    return function (value) {
        return precision * Math.round(value / precision);
    }
});