(function () {
    'use strict';

    angular
        .module('eventsjs')
        .controller('eventsListCtrl', control);

    control.$inject = [
        '$state',
        'eventsSrvc'
        ];
    
    function control(
        $state,
        eventsSrvc
    ) {
        var vm = angular.extend(this, {
            events : [],
            hasEvents : false,
            busy: false

         });
        

        

        function getEvents(){
            vm.events = eventsSrvc.getEvents();
            vm.hasEvents = vm.events.length != 0;
        }

        function onNewEvents(){
            vm.busy = false;
            getEvents();
        }

        function onError(error){
            vm.busy = false;
            console.log(`Error: ${JSON.stringify(error)}`);
        }


        function updateEvents(){
            //console.log(vm.busy);
            vm.busy = true;
            eventsSrvc.updateEvents()
            .then(onNewEvents)
            .catch(onError)   
        }

        
        vm.onItemSelected = function(index){
            console.log("Item : " + index);
            eventsSrvc.connectFromList(index)
            .then(function(result){
                $state.go('main_menu');
            })
            .catch(function(error){ alert(error);})
        }


        vm.update = function(){
            updateEvents();
        }

        vm.main = function(){
            $state.go('main_menu');
        }

        getEvents();

        
            
    }
})();
