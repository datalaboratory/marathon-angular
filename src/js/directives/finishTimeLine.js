angular.module('marathon').directive('finishTimeLine', function () {
    return {
        restrict: 'E',
        templateUrl: 'directives/finishTimeLine.html',
        templateNamespace: 'svg',
        replace: true,
        link: function link($scope, $element) {
            var svg = $element.parent();
            var width = svg.width();
            var d3rect = d3.select($element[0]).select('rect');
            var gradient = d3.select(svg[0]).append("svg:defs")
                .append("svg:linearGradient")
                .attr("id", "timeline_gradient")
                .attr("x1", "0%")
                .attr("x2", "0%")
                .attr("y1", "0%")
                .attr("y2", "100%")
                .attr("spreadMethod", "pad");

            gradient.append("svg:stop")
                .attr("offset", "0%")
                .attr("stop-color", "#f8d3dc");

            gradient.append("svg:stop")
                .attr("offset", "100%")
                .attr("stop-color", "#d3dff7");
            d3rect.attr({x: 0, y: 0, height: 4, fill: 'url(#timeline_gradient)'});

            $scope.$watch('time.current', function (time) {
                var currentWidth = Math.round(width * time / $scope.time.maxTime) - 25;
                if (currentWidth < 0) currentWidth = 0;
                d3rect.attr({width: currentWidth});
            });

            var timeMarksCount = Math.floor($scope.time.maxTime / 600) + 1;
            var step = Math.round(width * 600 / $scope.time.maxTime);
            $scope.timeMarks = d3.range(0, timeMarksCount * step, step).concat([width]);
        }
    }
});