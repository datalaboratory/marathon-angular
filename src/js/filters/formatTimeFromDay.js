angular.module('marathon').filter('formatTimeFromDay', function () {
    return function (date, isLast) {
        if (!date) return '';
        if (isLast) return moment(date).format('hh:mm:ss');
        return moment(date).format('hh:mm')
    };
});
