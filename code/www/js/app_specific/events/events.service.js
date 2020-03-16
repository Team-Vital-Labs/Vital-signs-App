(function () {
    'use strict';

    angular
        .module('eventsjs')
        .factory('eventsSrvc', eventsSrvc);

    eventsSrvc.$inject = [
        '$q', // promises service
        '$timeout' // timeout service

    ];

    function eventsSrvc(
        $q,
        $timeout
    ) {
        var eventsArray = [];
        var event = {};
        var detail = {};
        var device_id = "";
        var service_id = "";
        var characteristic_id = "";
        var property = "";
        var isBusy = false;
        var service = {};
        var TIMEOUT_MS = 1000;


        var file ="";
        var file_getting =false;
        var file_recived_data = false;
        var done_var ={ aInternal: false,
            aListener: function(val) {},
                set a(val) {
                this.aInternal = val;
                this.aListener(val);
            },
            get a() {
                return this.aInternal;
            },
            registerListener: function(listener) {
                this.aListener = listener;
        }}

        //var writeAnnotationExpectedInfo = ["ec00", "ec0e"];
        var writeAnnotationExpectedInfo = ["25576d0e-7452-4910-900b-1a9f82c19a7d", "a66ae744-46ab-459b-9942-5e502ac21640"];
        var notifyFileExpectedInfo = ["a8a4d5bf-d2cb-4df5-8e95-a9d6ca7112cf", "4ab6dea3-5256-47d5-b240-cee16ec4c3b9"];
        var manifestExpectedInfo = ["a8a4d5bf-d2cb-4df5-8e95-a9d6ca7112cf", "19cbb8e3-a1c5-4b9a-b98c-3ba0f3b10dc3"];


        function startScan() {
            var deferred = $q.defer();
            isBusy = true;
            eventsArray = [];

            $timeout(
                function () {
                    stopScan();
                    deferred.resolve();
                }
                , TIMEOUT_MS);

            ble.startScan(
                [],
                function (device) {
                    if (!!device.name) {
                        eventsArray.push({
                            id: device.id,
                            name: device.name
                        });
                    }
                },
                function (error) {
                    console.log("BLE: error " + JSON.stringify(error, null, 2));
                    deferred.reject(error);

                }
            );

            return deferred.promise;
        }

        function stopScan() {
            if (isBusy) {
                isBusy = false;
                ble.stopScan();
            }

        }

        function asyncScan() {
            var deferred = $q.defer();

            if (!isBusy) {
                startScan().then(
                    function () {
                        deferred.resolve();
                    },
                    function () {
                        deferred.reject();
                    }
                );
            } else {
                $timeout(function () {
                    deferred.resolve();
                });
            }

            return deferred.promise;
        }

        // EXAMPLE DETAIL - direct from a connection
        // {
        //   "name": "BLE: Alice DigitalLabs",
        //   "id": "B8:27:EB:C9:49:5D",
        //   "advertising": {},
        //   "rssi": -42,
        //   "services": [
        //     "1800",
        //     "1801",
        //     "25576d0e-7452-4910-900b-1a9f82c19a7d"
        //   ],
        //   "characteristics": [
        //     {
        //       "service": "1800",
        //       "characteristic": "2a00",
        //       "properties": [
        //         "Read"
        //       ]
        //     },
        //     {
        //       "service": "1800",
        //       "characteristic": "2a01",
        //       "properties": [
        //         "Read"
        //       ]
        //     },
        //     {
        //       "service": "1801",
        //       "characteristic": "2a05",
        //       "properties": [
        //         "Indicate"
        //       ],
        //       "descriptors": [
        //         {
        //           "uuid": "2902"
        //         }
        //       ]
        //     },
        //     {
        //       "service": "25576d0e-7452-4910-900b-1a9f82c19a7d",
        //       "characteristic": "a66ae744-46ab-459b-9942-5e502ac21640",
        //       "properties": [
        //         "Read"
        //       ]
        //     },
        //     {
        //       "service": "25576d0e-7452-4910-900b-1a9f82c19a7d",
        //       "characteristic": "4541e38d-7a4c-48a5-b7c8-61a0c1efddd9",
        //       "properties": [
        //         "Read"
        //       ]
        //     },
        //     {
        //       "service": "25576d0e-7452-4910-900b-1a9f82c19a7d",
        //       "characteristic": "fbfa8e9c-c1bd-4659-bbd7-df85c750fe6c",
        //       "properties": [
        //         "Read"
        //       ]
        //     }
        //   ]
        // }
        // EXAMPLE DETAIL OUTPUT service > characteristic > properties
        // {
        //     "1800": {
        //       "2a00": {
        //         "properties": [
        //           "Read"
        //         ]
        //       },
        //       "2a01": {
        //         "properties": [
        //           "Read"
        //         ]
        //       }
        //     },
        //     "1801": {
        //       "2a05": {
        //         "properties": [
        //           "Indicate"
        //         ]
        //       }
        //     },
        //     "25576d0e-7452-4910-900b-1a9f82c19a7d": {
        //       "a66ae744-46ab-459b-9942-5e502ac21640": {
        //         "properties": [
        //           "Read"
        //         ]
        //       },
        //       "4541e38d-7a4c-48a5-b7c8-61a0c1efddd9": {
        //         "properties": [
        //           "Read"
        //         ]
        //       },
        //       "fbfa8e9c-c1bd-4659-bbd7-df85c750fe6c": {
        //         "properties": [
        //           "Read"
        //         ]
        //       }
        //     }
        //   }
        function processDetail(data) {

            var detail = {};

            var characteristics = data.characteristics;
            characteristics.forEach(
                function (item) {
                    if (!detail[item.service]) {
                        detail[item.service] = {};
                        //console.log("detail["+item.service+"] = {};");
                    }
                    if (!detail[item.service][item.characteristic]) {
                        detail[item.service][item.characteristic] = {};
                        //console.log("detail["+item.service+"]["+item.characteristic+"] = {};");
                    }
                    if (!detail[item.service][item.characteristic].properties) {
                        detail[item.service][item.characteristic].properties = [];
                        //console.log("detail[" + item.service +"]["+item.characteristic+"].properties = [];");
                    }
                    detail[item.service][item.characteristic].properties =
                        detail[item.service][item.characteristic].properties.concat(item.properties);
                }
            );

            return detail;



        }



        function connectGetDetailDisconnect(id) {
            var deferred = $q.defer();

            if (!isBusy) {
                isBusy = true;
                device_id = id;
                detail = [];
                ble.connect(
                    id,
                    function (data) {
                        console.log(JSON.stringify(data, null, 2));
                        detail = processDetail(data);
                        ble.disconnect(
                            id,
                            function () {
                                isBusy = false;
                                deferred.resolve(detail);
                            },
                            function (error) {
                                isBusy = false;
                                deferred.reject(error);
                            });
                    },
                    function (error) {
                        // assume the device has disconnected.
                        isBusy = false;
                        console.log(JSON.stringify(error, null, 2));
                        deferred.reject(error);
                    });
            } else {
                $timeout(
                    function () {
                        deferred.resolve({});
                    }
                );
            }


            return deferred.promise;

        }

        function connectWriteDisconnect(device_id, service_id, characteristic_id, arraybuffer) {
            var deferred = $q.defer();

            if (!isBusy) {
                isBusy = true;
    
                ble.connect(
                    device_id,
                    function (data) {

              
                        ble.write(device_id, service_id, characteristic_id,arraybuffer,
                            function (response) {
                                ble.disconnect(
                                    device_id,
                                    function () {
                                        isBusy = false;
                                        deferred.resolve(response);
                                    },
                                    function (error) {
                                        isBusy = false;
                                        deferred.reject(error);
                                    });

                            },
                            function (error) {
                                // assume the deivice has disconnected.
                                isBusy = false;
                                console.log(JSON.stringify(error, null, 2));
                                deferred.reject(error);
                            });
                    },
                    function (error) {
                        // assume the deivice has disconnected.
                        isBusy = false;
                        console.log(JSON.stringify(error, null, 2));
                        deferred.reject(error);
                    });
            } else {
                $timeout(
                    function () {
                        deferred.resolve({});
                    }
                );
            }


            return deferred.promise;

        }

        function connectReadDisconnect(device_id, service_id, characteristic_id) {
            var deferred = $q.defer();

            if (!isBusy) {
                isBusy = true;
                
                ble.connect(
                    device_id,
                    function (data) {

   
                        ble.read(device_id, service_id, characteristic_id,


                            function (response) {

                                ble.disconnect(
                                    device_id,
                                    function () {
                                        isBusy = false;
                                        deferred.resolve(response);
                                    },
                                    function (error) {
                                        isBusy = false;
                                        deferred.reject(error);
                                    });

                            },
                            function (error) {
                                // assume the deivice has disconnected.
                                isBusy = false;
                                console.log(JSON.stringify(error, null, 2));
                                deferred.reject(error);
                            });
                    },
                    function (error) {
                        // assume the deivice has disconnected.
                        isBusy = false;
                        console.log(JSON.stringify(error, null, 2));
                        deferred.reject(error);
                    });
            } else {
                $timeout(
                    function () {
                        deferred.resolve({});
                    }
                );
            }


            return deferred.promise;

        }


        service.updateEvents = function () {
            console.log(isBusy);
            return asyncScan();
        }

        function getNames(eventsArray) {
            var result = [];
            eventsArray.forEach(function (event) {
                result.push(event.name);
            });
            return result;
        }


        service.getEvents = function () {
            return getNames(eventsArray);
        }

        service.getNumEvents = function () {
            return eventsArray.length;
        }

        service.selectEventAt = function (index) {
            event = eventsArray[index];
            //ble.connect(event.id, function(){alert("connected!");}, function(){alert("disconnected!");});
        }

        service.getEvent = function () {
            return event;
        }

        service.updateDetail = function () {
            return connectGetDetailDisconnect(event.id);
        }

        service.getServices = function () {
            return Object.keys(detail);
        }

        service.selectService = function (id) {
            service_id = id;
        }

        service.getService = function () {
            return service_id;
        }

        service.getCharacteristics = function () {
            return Object.keys(detail[service_id]);
        }

        service.selectCharacteristic = function (id) {
            characteristic_id = id;
        }

        service.getCharacteristic = function () {
            return characteristic_id;
        }

        service.getProperties = function () {
            return detail[service_id][characteristic_id].properties;
        }

        service.selectProperty = function (value) {
            property = value;
        }

        service.getProperty = function () {
            return property;
        }

        function connect(id)
        {
            
            return new Promise (function(resolve,reject){
                // if (!isBusy) {
                //     isBusy = true;

                    ble.connect(id,
                        function (data) {
                            console.log(JSON.stringify(data, null, 2));
                            detail = processDetail(data);
                            isBusy = false;
                            resolve(detail);
                        },
                        function(){
                            isBusy = false;
                            alert("Failed or Disconnected from "+ id);
                            console.log("Failed or Disconnected from "+ id);
                            resetDevice();
                            reject("Failed or disconnected");
                        }
                    );
                }
                // else{
                //     reject("App is busy");
                // }
                
            //}
            );
        }

        service.connect = function(){
            return connect(id);
        }

        service.connectFromList = function(index){
            event = eventsArray[index];
            return connect(event.id);
        }

        service.connectReadDisconnect = function(){
            return connectReadDisconnect(device_id, service_id, characteristic_id);
        }

        service.connectWriteDisconnect = function(arraybuffer){
            return connectWriteDisconnect(device_id, service_id, characteristic_id, arraybuffer);
        }

        function stringToByte(string) {
            var array = new Uint8Array(string.length);
            for (var i = 0, l = string.length; i < l; i++) {
                array[i] = string.charCodeAt(i);
             }
             return array.buffer;
         }
         service.stringToBytes= function(string){
             return stringToByte(string);
         }

        service.bytesToString= function(buffer) {
            return String.fromCharCode.apply(null, new Uint8Array(buffer));
        }

        service.writeAnnotation = function(message){
            return new Promise (function(resolve,reject){
                isBusy = true;
                console.log("Sending message: " + message)
                ble.write(event.id,writeAnnotationExpectedInfo[0],writeAnnotationExpectedInfo[1],message,
                    function(){
                        isBusy = false;
                        console.log("Sent!");
                        resolve(true);
                    },
                    function(){
                        isBusy = false;
                        console.log("failed " + event.id +" "+ writeAnnotationExpectedInfo[0] +" " +writeAnnotationExpectedInfo[1] );
                        reject(false);
                    });
            });
        }

        function stopNotification(){
            return new Promise(function(resolve, reject){
                ble.stopNotification(event.id,notifyFileExpectedInfo[0], notifyFileExpectedInfo[1],
                    function(){
                        console.log("Stopped Notifiying");
                        resolve("done");
                    }, 
                    function(){
                        console.log("This Failed!");
                        reject("Failed");
                });
            });
        }

        service.getFile = function(fileName){
            return new Promise(function(resolve, reject){
                if(!isBusy)
                {
                    file ="";
                    isBusy = true;
                    file_getting = true;

                    connect(event.id)
                    .then(function(result){

                        setNotify()
                        .then(function(){
                            writeFileName(fileName)
                            .then(function(){
                                file_recived_data = false;
                                writeContinue().then(function(result){
                                    console.log("got into here");

                                    done_var.registerListener(function(val) {
                                        console.log("About to stop Notification");
                                        disconnectWithoutForgetting().
                                        then(function(){
                                            resolve(file);
                                        }).catch(function(){
                                            console.log("FAILED");
                                        });
                                    });

                                    
                                })
                                .catch(function(err){
                                    file_getting = false;
                                    isBusy = false;
                                    reject(err);
                                });

                            }).catch(function(err){
                                file_getting = false;
                                isBusy = false;
                                reject(err);
                            });
                        }).catch(function(err){
                            file_getting = false;
                            isBusy = false;
                            reject(err);
                        });
                    })}
                    else{
                        reject("Busy");
                    }
                }); 
            
                

        }

        //function startFileTransfer(fileName)

        function writeContinue(){
            return new Promise(function(resolve, reject){
                var continueByte = stringToByte("CONTINUE");
                ble.write(event.id,notifyFileExpectedInfo[0], notifyFileExpectedInfo[1],continueByte,
                    function(){
                        //wait(100);
                        //console.log("TOLD PI TO CONTINUE");
                        file_recived_data = false;
                        resolve(true);
                    },function(){
                        resolve(false);
                    });
            });
        }

        function writeFileName(filename){
            return new Promise(function(resolve,reject){
                var en_filename = stringToByte(filename); 
                ble.write(event.id,notifyFileExpectedInfo[0], notifyFileExpectedInfo[1],
                    en_filename,
                    function(){
                        console.log("File name sent");
                        resolve("Start getting file");
                    }, function(){
                        reject("Failed writing file name");
                    });
            });
        }


        service.getManifest = function(){
            return new Promise(function(resolve, reject){
                ble.read(event.id,manifestExpectedInfo[0], manifestExpectedInfo[1],
                    function(result){
                        var decoded = new TextDecoder().decode(result);
                        console.log("Manifest: " + decoded);
                        resolve(decoded);
                    },function(){
                        reject("Failed");
                    });
            });
        }

        //INFO FOR THE CHARACTERIST IS SET AT THE TOP
        function setNotify(){
            return new Promise(function(resolve, reject){
                ble.startNotification(event.id,notifyFileExpectedInfo[0], notifyFileExpectedInfo[1],
                    function(buffer){
                        console.log("Got Notification");
                        var decoded = new TextDecoder().decode(buffer);
                        console.log(decoded);
                        while(file_recived_data==true){console.log("Waiting for last info to process")}
                        if(decoded == "DONE")
                        {
                            //console.log("done apparantly");
                            file_getting = false;
                            done_var.a =true;
                        }
                        else{
                            file += decoded;
                            //console.log(file);
                            //file_recived_data=true;
                            //wait(100);
                            writeContinue();
                        }
                    },function(){
                        console.log("Notification Failed! ");
                        alert("Notification Failed!");
                    });
                console.log("Notification set");
                resolve(true);
            })
        }

        function disconnectWithoutForgetting(){
            return new Promise(function(resolve, reject){
                ble.disconnect(event.id,
                    function(){
                        console.log("Disconnected but still remebering info");
                        resolve("worked");
                    },
                    function(){
                        console.log("failed to disocnnect, don't ask how");
                        reject("failed");
                    });
            });
        }

        service.disconnectWithoutForgetting = function(){
            return disconnectWithoutForgetting();
        }

        service.disconnect = function()
        {
            return new Promise (function(resolve,reject){
                isBusy = true;
                console.log("began disconnecting " + event.id)
                ble.disconnect(event.id,
                    function(){
                        resetDevice();
                        console.log("Disconnected from " +event.name);
                        resolve(true);
                    },
                    function(){
                        isBusy = false;
                        console.log("failed");
                        reject(false);
                    });
            });
        }

        function resetDevice()
        {
            eventsArray = [];
            event = {};
            detail = {};
            device_id = "";
            service_id = "";
            characteristic_id = "";
            property = "";
            isBusy = false;
            service = {};
        };

        function wait(ms)
        {
        var d = new Date();
        var d2 = null;
        do { d2 = new Date(); }
        while(d2-d < ms);
        }


        return service;

    }


})();