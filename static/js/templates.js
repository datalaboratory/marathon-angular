angular.module('marathon').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('directives/finishTimeLine.html',
    "<g>\n" +
    "    <rect></rect>\n" +
    "    <line y1=\"0\"\n" +
    "          y2=\"4\"\n" +
    "          stroke=\"#000\"\n" +
    "          data-ng-repeat=\"x in timeMarks\"\n" +
    "          data-ng-attr-x1=\"{{x}}\"\n" +
    "          data-ng-attr-x2=\"{{x}}\"></line>\n" +
    "</g>\n"
  );


  $templateCache.put('directives/mapContainer.html',
    "<svg class=\"map-container\"></svg>"
  );


  $templateCache.put('directives/selectedRunnerInfo.html',
    "<div\n" +
    "        class=\"selected-runner-info\"\n" +
    "        data-ng-class=\"{'selected-runner-info--hidden': !selectedRunnerOnGraph}\">\n" +
    "    <div class=\"selected-runner-info__text\"\n" +
    "         style=\"\n" +
    "            right: {{selectedRunnerPosition.x + 4}}px;\n" +
    "            bottom: {{selectedRunnerPosition.y + 4}}px;\">\n" +
    "        <div class=\"selected-runner-info__black\">{{selectedRunnerOnGraph.full_name}},<br>{{selectedRunnerOnGraph|ageString}}\n" +
    "        </div>\n" +
    "        <div class=\"selected-runner-info__white\">\n" +
    "            <span class=\"selected-runner-info__result-time\">{{selectedRunnerOnGraph.result_time_string}}</span><br>\n" +
    "            <span class=\"selected-runner-info__result-position\">\n" +
    "               <!-- в локализацию -->\n" +
    "                {{selectedRunnerOnGraph|finishedPosition}}</span>\n" +
    "        </div>\n" +
    "        <div class=\"selected-runner-info__yellow\">\n" +
    "            <div class=\"selected-runner-info__logo-number\">\n" +
    "                <img src=\"img/mm-logo-small.png\">{{selectedRunnerOnGraph.num}}\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"selected-runner-info__pointer\"\n" +
    "         style=\"\n" +
    "            right: {{selectedRunnerPosition.x}}px;\n" +
    "            bottom: {{selectedRunnerPosition.y}}px;\n" +
    "            width: {{selectedRunnerStepSize.width}}px;\n" +
    "            height: {{selectedRunnerStepSize.height}}px;\n" +
    "        \"></div>\n" +
    "</div>"
  );


  $templateCache.put('directives/slider.html',
    "<div class=\"slider\">\n" +
    "    <span class=\"slider__selected-time\">{{selectedTime}}</span>\n" +
    "    <img class=\"slider__handle\" src=\"img/scroll-marker-top.png\">\n" +
    "    <img class=\"slider__line\" src=\"img/scroll-marker-bottom.png\">\n" +
    "</div>"
  );


  $templateCache.put('directives/timeGraph.html',
    "<div class=\"time-graph\">\n" +
    "    <svg\n" +
    "            class=\"time-graph__svg\"\n" +
    "            data-ng-mousemove=\"selectRunnerOnGraph($event)\">\n" +
    "        <finish-time-line></finish-time-line>\n" +
    "    </svg>\n" +
    "    <selected-runner-info></selected-runner-info>\n" +
    "</div>"
  );

}]);
