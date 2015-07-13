angular.module('dataLab').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('dropdownFilter/dropdownFilter.html',
    "<div\n" +
    "        class=\"dropdown-filter\"\n" +
    "        data-ng-class=\"{ 'dropdown-filter--open': state == 'open' }\">\n" +
    "    <span\n" +
    "            class=\"dropdown-filter__current-value\"\n" +
    "            tabindex=\"0\"\n" +
    "            data-ng-bind-html=\"currentValue|trust\"\n" +
    "            data-ng-click=\"toggleList()\"\n" +
    "            data-ng-blur=\"closeList()\"></span>\n" +
    "    <ul class=\"dropdown-filter__list\">\n" +
    "        <li\n" +
    "                data-ng-if=\"config.allValues\"\n" +
    "                data-ng-mousedown=\"select(null)\"\n" +
    "                data-ng-bind-html=\"config.allValues|trust\"\n" +
    "                data-ng-class=\"{'dropdown-filter__item--active': currentId == null }\"\n" +
    "                class=\"dropdown-filter__item\"></li>\n" +
    "        <li\n" +
    "                data-ng-repeat=\"(id, text) in values\"\n" +
    "                data-ng-mousedown=\"select(id)\"\n" +
    "                data-ng-bind-html=\"text|trust\"\n" +
    "                data-ng-class=\"{'dropdown-filter__item--active': currentId == id }\"\n" +
    "                class=\"dropdown-filter__item\"></li>\n" +
    "    </ul>\n" +
    "</div>\n" +
    "\n" +
    "\n" +
    "\n" +
    "\n"
  );

}]);
