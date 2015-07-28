angular.module('marathon').filter('formatTimeFromStart', function () {
    return function (date, start, isLast) {
        if (!date) return '';
        if (isLast) return moment(date).subtract(start).format('HH:mm:ss');
        return moment(date).subtract(start).format('HH:mm');
    };
});
