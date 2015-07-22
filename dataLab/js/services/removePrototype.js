angular.module('dataLab').constant('removePrototype', function (object) {
    var result = {};
    for (var key in object) {
        result[key] = object[key];
    }
    return result;
});