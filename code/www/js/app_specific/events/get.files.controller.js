(function () {
    'use strict';

    angular
        .module('eventsjs')
        .controller('getFilesCtrl', control);

    control.$inject = [
        '$state',
        'eventsSrvc',
        'oneDriveSrvc'
        ];
    
    function control(
        $state,
        eventsSrvc,
        oneDriveSrvc
    ) {


        //{"path":"/home/pi/bluetooth_pi_2-master/little_blue_pi/files",
        //"name":"files",
        //"children":[
        //     {"path":"/home/pi/bluetooth_pi_2-master/little_blue_pi/files/2020-03-16_22-00-32",
        //     "name":"2020-03-16_22-00-32",
        //     "children":[
        //         {"path":"/home/pi/bluetooth_pi_2-master/little_blue_pi/files/2020-03-16_22-00-32/Sacramentorealestatetransactions.csv",
        //         "name":"Sacramentorealestatetransactions.csv",
        //         "size":4229,
        //         "extension":".csv",
        //         "type":"file"},
        //         {"path":"/home/pi/bluetooth_pi_2-master/little_blue_pi/files/2020-03-16_22-00-32/test.csv",
        //         "name":"test.csv",
        //         "size":1329,"extension":".csv",
        //         "type":"file"}]
        //         ,"size":5558,
        //         "type":"directory"},
        //     {"path":"/home/pi/bluetooth_pi_2-master/little_blue_pi/files/2020-03-16_22-03-54",
        //     "name":"2020-03-16_22-03-54",
        //     "children":[
        //         {"path":"/home/pi/bluetooth_pi_2-master/little_blue_pi/files/2020-03-16_22-03-54/Sacramentorealestatetransactions.csv",
        //         "name":"Sacramentorealestatetransactions.csv",
        //         "size":4229,
        //         "extension":".csv",
        //         "type":"file"},
        //         {"path":"/home/pi/bluetooth_pi_2-master/little_blue_pi/files/2020-03-16_22-03-54/test.csv",
        //         "name":"test.csv",
        //         "size":1329,
        //         "extension":".csv",
        //         "type":"file"}],
        //     "size":5558,
        //     "type":"directory"}],
        // "size":11116,
        // "type":"directory"}
        oneDriveSrvc.createFolder("VitalSigns","").then(
        eventsSrvc.getManifest().then(
        async function(result){
            var manifest = JSON.parse(result);
            for(var i in manifest.children){

                await oneDriveSrvc.createFolder(manifest.children[i].name,"VitalSigns")
                .then(async function(result){
                    for(var j in manifest.children[i].children){
                        await eventsSrvc.getFile(manifest.children[i].children[j].path)
                        .then(function(result){
                            console.log("Getting into here fine");
                            oneDriveSrvc.upload(result, "VitalSigns/"+manifest.children[i].name,manifest.children[i].children[j].name.substring(0,manifest.children[i].children[j].name.length-4))
                            .then(function(result){
                                alert(result);
                            }).catch(function(err){
                                console.log(err);
                            });
                        })
                        .catch(
                            function(error){
                                alert("Sorry, " + error);
                                $state.go('main_menu');
                            }
                        );
            }})

                
            }

            $state.go('main_menu');

            // eventsSrvc.getFile("test.csv")
            // .then(function(result){
            //     console.log("Getting into here fine");
            //     oneDriveSrvc.upload(result, "VitalSigns","test")
            //     .then(function(result){
            //         $state.go('main_menu');
            //     }).catch(function(err){
            //         console.log(err);
            //     });
            // })
            // .catch(
            //     function(error){
            //         alert("Sorry, " + error);
            //         $state.go('main_menu');
            //     }
            // );
        }).catch(function(err){
            console.log(err);
        })).catch(function(err){
            console.log(err);
        })


        // eventsSrvc.getManifest()
        // .then(function(result){
        //     //Expecting json file for the manifest
        //     console.log("Manifest: "+result);
        //     var manifest = JSON.parse(result);
        //     oneDriveSrvc.createFolder("VitalSigns","")
        //     .then(function(){
        //         var i ="";
        //         for(i in manifest)
        //         {
        //             oneDriveSrvc.createFolder(manifest[i].name,"VitalSigns")
        //             .then(function(){
        //                 var j = "";
        //                 for(j in manifest[i].file)
        //                 {
        //                     eventsSrvc.getFile(manifest[i].file[j])
        //                     .then(function(result){
        //                         oneDriveSrvc.upload(result, "VitalSigns/"+manifest[i].name, manifest[i].file[j])
        //                         .then(function(){
        //                             //delete file
        //                         });
        //                     });
        //                 }

        //                 //delete the folder
        //             });
        //         }
        //         $state.go('main_menu');

        //     });
        //     //$state.go('main_menu');
        // })
        // .catch(
        //     function(error){
        //         alert("Sorry, " + error);
        //         $state.go('main_menu');
        //     }
        // );
    }
})();
