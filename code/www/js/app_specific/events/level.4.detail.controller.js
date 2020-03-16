(function () {
    'use strict';

    angular
        .module('eventsjs')
        .controller('level3DetailCtrl', control);

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
            characteristic_id: 'no characteristic id',
            items : [],
            busy : false,
            hasItems: false
         });
        
        vm.onItemSelected = function(index){
            
        }

        vm.done = function(){
            $state.go('level_2_detail');
        }

        var event = eventsSrvc.getEvent();
        vm.name = event.name;
        vm.id = event.id;
        vm.service_id = eventsSrvc.getService();
        vm.characteristic_id = eventsSrvc.getCharacteristic();
        vm.items = eventsSrvc.getProperties();
        vm.hasItems = vm.items.length > 0;
    }
})();
