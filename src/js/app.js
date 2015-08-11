var app = angular.module('marathon', [
    'dataLab',
    'pascalprecht.translate'
]);
app.config(function ($translateProvider, translationRu, translationEn) {
    $translateProvider
        .translations('ru', translationRu)
        .translations('en', translationEn);
    $translateProvider.preferredLanguage('ru');
});