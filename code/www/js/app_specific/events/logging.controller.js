(function () {
    'use strict';

    angular
        .module('eventsjs')
        .controller('loggingCtrl', control);

    control.$inject = [
        '$scope',
        '$state',
        'eventsSrvc'
        ];
    
    function control(
        $scope,
        $state,
        eventsSrvc
    ) {
        var vm = angular.extend(this, {
            events : [],
            hasEvents : false,
            busy: false,
            annotation: ""
         });
        
        console.log("Logging");

        vm.stopLog = function(){
            vm.busy =true;
            var message = eventsSrvc.stringToBytes("_STOP_");
            eventsSrvc.writeAnnotation(message)
            .then(function(result){
                vm.busy = false;
                $state.go('main_menu');
            })
            .catch(function(error){
                alert("STOP Failed");
                vm.busy = false;
            });
        }
        
        vm.annotate = function()
        {
            vm.busy = true;
            var message = eventsSrvc.stringToBytes(vm.annotation);
            eventsSrvc.writeAnnotation(message)
            .then(function(result){
                vm.annotation = "";
                vm.busy = false;
                $scope.$apply();
            })
            .catch(function(error){
                alert("Message Failed");
                vm.busy = false;
                vm.annotation = "";
                $scope.$apply();
            });
        }
            
    }
})();
