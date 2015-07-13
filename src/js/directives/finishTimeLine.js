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
                var currentWidth = $scope.timeScale(time) - 25;
                if (currentWidth < 0) currentWidth = 0;
                d3rect.attr({width: currentWidth});
            });

            var timeMarksCount = Math.ceil($scope.time.maxTime / 600);
            var tickTimes = [];
            for (var i = 0; i < timeMarksCount; i++) {
                var mark = moment($scope.time.start).add(10 * i, 'm').toDate();
                tickTimes.push($scope.timeScale(mark));
            }
            tickTimes.push(width);
            $scope.tickTimes = tickTimes;
        }
    }
});