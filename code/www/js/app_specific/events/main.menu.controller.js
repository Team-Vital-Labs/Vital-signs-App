(function () {
    'use strict';

    angular
        .module('eventsjs')
        .controller('mainMenuCtrl', control);

    control.$inject = [
        '$scope',
        '$state',
        'eventsSrvc',
        'authenticateSrvc',
        'oneDriveSrvc'
        ];
    
    function control(
        $scope,
        $state,
        eventsSrvc,
        authenticateSrvc,
        oneDriveSrvc
    ) {
        var vm = angular.extend(this, {
            events : [],
            isConnected : false,
            isLoggedin: false,
            busy: false,
            name: 'Not connected',
            login: 'Not Working'
         });

         vm.getDisplayName = function(){
            oneDriveSrvc.getDisplayName()
            .then(function(result){
                vm.login = result;
                console.log(result);
                $scope.$apply();
            }).catch(function(err){
                vm.login = "Not logged in";
                console.log(err);
                $scope.$apply();
            });
        }

        vm.scan = function(){
            $state.go('events_list');
        }

        vm.disconnect = function(){
            if(!vm.busy)
            {
                vm.busy = true;
                eventsSrvc.disconnect()
                .then(function(result){
                    //alert("Got into here");
                    vm.isConnected = false;
                    vm.name = 'Not connected';
                    vm.busy = false;
                })
                .catch(function(fail){
                    vm.busy = false;
                    alert("Failed to disconnect... somehow");
                });
            }
        }

        vm.startLoging = function(){
            vm.busy =true;
            eventsSrvc.connect().then(function(r){   
                var message = eventsSrvc.stringToBytes("_START_");
                eventsSrvc.writeAnnotation(message)
                .then(function(result){
                    vm.busy = false;
                    $state.go('logging');
                })
                .catch(function(error){
                    alert("START Failed");
                    vm.busy = false;
                });
            }).catch(function(){console.log("Failed to connect");});
        }

        vm.getFiles = function(){
            $state.go('get_files');
        }

        vm.authenticate = function () {
            authenticateSrvc.authenticate()
            .then(function(){
                vm.isLoggedin = authenticateSrvc.isAuthenticated();
                vm.getDisplayName();
            }).catch(function(){});
        }

        vm.logout = function(){
            authenticateSrvc.clear();
            vm.isLoggedin = authenticateSrvc.isAuthenticated();
            vm.login = "Not logged in";
        }   

        var event = eventsSrvc.getEvent();
        if(event.name){
            vm.name = event.name;
            vm.isConnected = true;
        }

        console.log("This has ran");

        vm.isLoggedin = authenticateSrvc.isAuthenticated();

        vm.getDisplayName();
    }
})();
