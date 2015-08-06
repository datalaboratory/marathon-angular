angular.module('marathon').controller('RenderController', function ($rootScope, $timeout) {
    var renderRequired = false;
    $rootScope.$on('renderRequired', function () {
        renderRequired = true;
        $timeout(function startRender() {
            if (!renderRequired) return;
            renderRequired = false;
            $rootScope.$broadcast('startRender');
        });
    });

});