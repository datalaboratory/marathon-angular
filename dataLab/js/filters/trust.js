angular.module('dataLab').filter('trust', function ($sce) {
    return function (html) {
        return $sce.trustAsHtml(html);
    }
});
