angular.module('marathon').filter('finishedPosition', function () {
    return function (runner) {
        if (!runner) return '';
        if (runner.gender == 0) {
            return 'Финишировала ' + runner.pos + '-й'
        }
        if (runner.gender == 1) {
            return 'Финишировал ' + runner.pos + '-м'
        }
    };
});
