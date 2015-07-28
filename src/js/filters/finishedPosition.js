angular.module('marathon').filter('finishedPosition', function ($rootScope) {
    return function (runner) {
        if (!runner) return '';
        if ($rootScope.language == 'ru') {
            if (runner.gender == 0) {
                return 'Финишировала ' + runner.pos + '-й'
            }
            if (runner.gender == 1) {
                return 'Финишировал ' + runner.pos + '-м'
            }
        }
        if ($rootScope.language == 'en') {
            if (runner.pos == 1) {
                return 'Finished ' + runner.pos + 'st'
            }
            if (runner.pos == 2) {
                return 'Finished ' + runner.pos + 'nd'
            }
            if (runner.pos == 3) {
                return 'Finished ' + runner.pos + 'rd'
            }
            return 'Finished ' + runner.pos + 'th'
        }
    };
});
