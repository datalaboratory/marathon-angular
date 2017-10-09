var app = angular.module('marathon', [
    'ngRoute',
    'dataLab',
    'pascalprecht.translate'
]);

app.config(function ($routeProvider, $locationProvider, $translateProvider, translationRu, translationEn) {
    $routeProvider
        .when('/results', {
            controller: 'MarathonController',
            templateUrl: 'pages/marathon.html',
            reloadOnSearch: false
        })
        .otherwise({redirectTo: '/results'});

    $locationProvider.html5Mode(true);

    $translateProvider
        .translations('ru', translationRu)
        .translations('en', translationEn)
        .preferredLanguage('ru');
});