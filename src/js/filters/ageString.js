angular.module('marathon').filter('ageString', function (numberDeclension) {
    return function (runner) {
        if (!runner) return '';
        return runner.age + ' ' + numberDeclension(runner.age, ['год', 'года', 'лет']);
    };
});
