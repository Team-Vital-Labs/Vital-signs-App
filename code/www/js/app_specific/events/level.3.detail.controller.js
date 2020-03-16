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
            id: 'no  id',
            name: 'no name',
            service_id: 'no service_id',
            characteristic_id: 'no characteristic id',
            items: [],
            responses: [],
            busy: false,
            hasItems: false,
            hasResponses: false

        });

        vm.onItemSelected = function (index) {
            var property = vm.items[index];
            eventsSrvc.selectProperty(property);

            if (property == "Read") {
                if (!vm.busy) {
                    vm.busy = true;
                    eventsSrvc.connectReadDisconnect()
                        .then(function (response) {

                            var decoded = new TextDecoder().decode(response);
                            vm.responses.push(decoded);
                            vm.hasResponses = true;
                            vm.busy = false;
                        })
                        .catch(function (error) {
                            console.log(JSON.stringify(error, null, 2));
                            vm.busy = false;
                        });
                }
            }
            else if(property == "Write"){
                //console.log("Writing code in here");

                if (!vm.busy) {
                    vm.busy = true;

                    var tempString = "Text to send to Pi";
                    var arrayBufferedts = eventsSrvc.stringToBytes(tempString);//new TextEncoder().encode(tempString); 
                    eventsSrvc.connectWriteDisconnect(arrayBufferedts)
                        .then(function (response) {

                            //var decoded = new TextDecoder().decode(response);
                            //vm.responses.push(decoded);
                            alert("Message successfully sent!");
                            vm.hasResponses = true;
                            vm.busy = false;
                        })
                        .catch(function (error) {
                            console.log(JSON.stringify(error, null, 2));
                            vm.busy = false;
                        });
                }
            }

        }

        vm.done = function () {
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
