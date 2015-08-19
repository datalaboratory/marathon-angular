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

app.config( ['$provide', function ($provide){
    $provide.decorator('$sniffer', ['$delegate', function ($delegate) {
        $delegate.history = false;
        return $delegate;
    }]);
}])