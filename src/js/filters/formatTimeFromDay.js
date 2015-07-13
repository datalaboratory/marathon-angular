angular.module('marathon').filter('formatTimeFromDay', function () {
    return function (date) {
        if (!date) return '';
        return moment(date).format('hh:mm')
    };
});
