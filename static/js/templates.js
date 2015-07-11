angular.module('marathon').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('directives/mapContainer.html',
    "<svg class=\"map-container\"></svg>"
  );


  $templateCache.put('directives/slider.html',
    "<div class=\"slider\">\n" +
    "    <img class=\"slider__handle\" src=\"img/scroll-marker-top.png\">\n" +
    "    <img class=\"slider__line\" src=\"img/scroll-marker-bottom.png\">\n" +
    "</div>"
  );


  $templateCache.put('directives/timeGraph.html',
    "<div class=\"time-graph\">\n" +
    "    <svg class=\"time-graph__svg\"></svg>\n" +
    "    <slider></slider>\n" +
    "</div>"
  );

}]);
