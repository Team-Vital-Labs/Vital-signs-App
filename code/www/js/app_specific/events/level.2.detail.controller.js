(function () {
    'use strict';

    angular
        .module('eventsjs')
        .controller('level2DetailCtrl', control);

    control.$inject = [
        '$state',
        'eventsSrvc'
        ];
    
    function control(
        $state,
        eventsSrvc
    ) {
        var vm = angular.extend(this, {
            id : 'no  id',
            name: 'no name',
            service_id: 'no service_id',
            items : [],
            busy : false,
            hasItems: false
         });
        
        vm.onItemSelected = function(index){
            eventsSrvc.selectCharacteristic(vm.items[index]);
            $state.go('level_3_detail');
        }

        vm.done = function(){
            $state.go('events_detail');
        }

        var event = eventsSrvc.getEvent();
        vm.name = event.name;
        vm.id = event.id;
        vm.service_id = eventsSrvc.getService();
        vm.items = eventsSrvc.getCharacteristics();
        vm.hasItems = vm.items.length > 0;
    }
})();
