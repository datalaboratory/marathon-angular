angular.module('marathon').factory('genderColors', function (ageGroups) {

    function generateGradient(beginColor, endColor, stepsCount) {
    return d3.scale.linear()
        .domain([1, stepsCount])
        .range([beginColor, endColor])
        .clamp(true)
        .interpolate(d3.interpolateHcl);
    }

    var genderGradients = [
    generateGradient('#FFCBD5', '#EE2046', 5),
    generateGradient('#B8E8FF', '#1D56DF', 5)
    ];
    var ageGroupStarts = _.pluck(ageGroups.big, 'start');
    ageGroupStarts.shift();
    var colorNumberScale = d3.scale.threshold()
        .domain(ageGroupStarts)
        .range(d3.range(1, 6));
    return {
        generateGradient: generateGradient,
        genderGradients: genderGradients,
        colorNumberScale: colorNumberScale
    }
});