angular.module('marathon').filter('formatTimeFromStart', function () {
    return function (date, start) {
        if (!date) return '';
        return moment(date).subtract(start).format('HH:mm');
    };
});
