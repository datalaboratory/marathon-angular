angular.module('dataLab').constant('toGrayscale', function (color) {
    var lab = d3.lab(color);
    lab.a = 0;
    lab.b = 0;
    return lab.toString()
});
