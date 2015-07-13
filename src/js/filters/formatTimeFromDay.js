angular.module('marathon').filter('formatTimeFromStart', function () {
    return function (date) {
        if (!date) return '';
        return moment(date).format('hh:mm')
    };
});
