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
            //{"path":"/home/pi/bluetooth_pi_2-master/little_blue_pi/files/Sacramentorealestatetransactions.csv",
            //"name":"Sacramentorealestatetransactions.csv",
            //"size":113183,
            //"extension":".csv",
            //"type":"file"},
            //{"path":"/home/pi/bluetooth_pi_2-master/little_blue_pi/files/test.csv",
            //"name":"test.csv",
            //"size":873,
            //"extension":".csv",
            //"type":"file"}],
        //"size":114056,
        //"type":"directory"}

        eventsSrvc.getManifest()
        .then(function(result){
            var manifest = JSON.parse(result);
            for(var i in manifest.children){
                
            }
            eventsSrvc.getFile("test.csv")
            .then(function(result){
                console.log("Getting into here fine");
                oneDriveSrvc.upload(result, "VitalSigns","test")
                .then(function(result){
                    $state.go('main_menu');
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
        }).catch(function(err){
            console.log(err);
        })




        // manifest = {
        //     "3folder_2":{
        //         "name":"2020-03-18_15-34-10",
        //       "file": ["test.csv", "jkdfghdfgssssssssssssssssssssssssssssssssshdfdfgdfsgsdfsdfdsfgdfgdfgbkdh"]
        //     },
        //     "folder-1":{
        //         "name":"2020-03-18_15-28-34",
        //       "file": ["test.csv","tis this one"]
        //     }
        //   }


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
