(function () {
    'use strict';

    angular
        .module('eventsjs')
        .controller('eventsDetailCtrl', control);

    control.$inject = [
        '$state',
        'eventsSrvc'
    ];

    function control(
        $state,
        eventsSrvc
    ) {
        var vm = angular.extend(this, {
            id: 'no id',
            name: 'no name',
            detail: {},
            items: [],
            busy: false,
            hasItems: false
        });


        function onNewDetail() {

            vm.busy = false;
            vm.items = eventsSrvc.getServices();
            vm.hasItems = vm.items.length > 0;

        }

        function onError(error) {
            vm.busy = false;
            console.log(`Error: ${JSON.stringify(error, null, 2)}`);
        }


        function updateDetail() {
            if (!vm.busy) {
                vm.busy = true;
                return eventsSrvc.updateDetail()
                    .then(
                        onNewDetail
                    )
                    .catch(
                        onError
                    );
            } else {
                return $timeout(function () { });
            }
        }


        vm.onItemSelected = function (index) {
            var service_id = vm.items[index];
            eventsSrvc.selectService(service_id);
            $state.go('level_2_detail');
        }

        vm.done = function () {
            $state.go('events_list');
        }

        vm.update = function () {
            updateDetail();
        }



        var event = eventsSrvc.getEvent();
        vm.name = event.name;
        vm.id = event.id;


    }
})();
