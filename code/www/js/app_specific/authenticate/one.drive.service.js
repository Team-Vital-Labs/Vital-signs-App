(function () {
    'use strict';

    angular
        .module('authenticatejs')
        .factory('oneDriveSrvc', oneDriveSrvc);

    oneDriveSrvc.$inject = [
        '$q', // promises service
        '$timeout', // timeout service
        'moment', // does dates really well
        'authenticateSrvc' // holds the auth token
    ];

    function oneDriveSrvc(
        $q,
        $timeout,
        moment,
        authenticateSrvc
    ) {
        
        
        var item = null;
        
        var itemPath = ""
        var service = {

        };



        // Downloads file contents
        // download_uri : temporary authenticated uri for a file (retrieved from file meta data)  
        function downloadContents(download_uri) {
            return new Promise(function (resolve, reject) {
                var download_request = new XMLHttpRequest();
                download_request.onreadystatechange = function () {
                    if (this.readyState == 4) {
                        if (this.status == 200) {
                            resolve([this.status, download_request.responseText]);
                        } else {
                            reject([this.status, download_request.responseText]);
                        }
                    }
                }
                download_request.open("GET", download_uri, true);
                download_request.send();
            });
        }

        function queryMetadata(token, uri) {
            return new Promise(function (resolve, reject) {




                var metaData_request = new XMLHttpRequest();

                metaData_request.onreadystatechange = function () {
                    if (this.readyState == 4) {
                        if (this.status == 200) {
                            resolve([this.status, metaData_request.responseText]);
                        } else {
                            reject([this.status, metaData_request.responseText]);
                        }
                    }
                };
                metaData_request.open("GET", uri, true);
                metaData_request.setRequestHeader("Authorization", "bearer " + token);
                metaData_request.send();
            });

        }

        service.getDisplayName = function(){
            var token = null;

            try{
                var authInfo = authenticateSrvc.getAuthInfo();
                token = authInfo.access_token;
            }catch(e){
                // ignore this. Pass null to async function. Allow to fail there.
            }

            var uri= "https://graph.microsoft.com/v1.0/me";

            return new Promise(function(resolve,reject){
                queryMetadata(token, uri)
                .then(function(response){
                    var result = JSON.parse(response[1]);
                    resolve(result.mail);
                }).catch(function(err){
                    reject(err);
                })
            });

        }



        function queryPath(token, path) {
            return new Promise(function (resolve, reject) {

                var uriStem = "https://graph.microsoft.com/v1.0/me/drive/root";

                var rootComponent = "/children"; // special case
                var uriComponent = rootComponent;
                if((!path == null)||(path.length>0)){
                    uriComponent = ":/" + path;
                }

                var uri = uriStem + uriComponent;

                queryMetadata(token, uri)
                .then(function (response) {
                    var result = JSON.parse(response[1]);   
                    if(Array.isArray(result.value)){
                        // this is the response of the root:/children endpoint
                        // each array item looks like this:
                        // {"createdDateTime":"2019-09-23T13:58:48Z","eTag":"\"{6E335610-8209-4FD4-B265-CD1626A346F6},1\"","id":"01GHONCGQQKYZW4CMC2RH3EZONCYTKGRXW","lastModifiedDateTime":"2019-09-23T13:58:48Z","name":"Appatella","webUrl":"https://stummuac-my.sharepoint.com/personal/55118836_ad_mmu_ac_uk/Documents/Appatella","cTag":"\"c:{6E335610-8209-4FD4-B265-CD1626A346F6},0\"","size":3154456,"createdBy":{"user":{"email":"L.Cooper@mmu.ac.uk","id":"2b378f77-5e47-4ee8-afcb-b5f8aa600bc4","displayName":"Laurie Cooper"}},"lastModifiedBy":{"user":{"email":"L.Cooper@mmu.ac.uk","id":"2b378f77-5e47-4ee8-afcb-b5f8aa600bc4","displayName":"Laurie Cooper"}},"parentReference":{"driveId":"b!wiFsUOXyAEyQGH3V6DHf8YXHIoDRXOxJhjN337XFN1Vdl-yWdkEPQbY4DeA8XwDt","driveType":"business","id":"01GHONCGV6Y2GOVW7725BZO354PWSELRRZ","path":"/drive/root:"},"fileSystemInfo":{"createdDateTime":"2019-09-23T13:58:48Z","lastModifiedDateTime":"2019-09-23T13:58:48Z"},"folder":{"childCount":5},"shared":{"scope":"users"}}
                        resolve(result.value);
                    }else{
                        if(result.folder==null){
                            downloadContents(result["@microsoft.graph.downloadUrl"])
                            .then(
                                function(result){
                                    resolve(result[1]);
                                }
                            )
                            .catch(
                                function(error){
                                    reject(error);
                                });
                        }else{
                            queryMetadata(token,uri + ":/children")
                            .then(
                                function(response){
                                    // we know this is an array
                                    var children = JSON.parse(response[1]); 
                                    resolve(children.value);  
                                }
                            )
                            .catch(
                                function(error){
                                    reject(error);
                                }
                            )
                        }
                    }
                })  
                .catch(
                    function (error) {
                        reject(error);
                    }
                );
            
        });
    }


        service.update = function (path) {
            var token = null;

            try{
                var authInfo = authenticateSrvc.getAuthInfo();
                token = authInfo.access_token;
            }catch(e){
                // ignore this. Pass null to async function. Allow to fail there.
            }


           return new Promise(function(resolve,reject){
                queryPath(token, path)
                .then(  
                    function(response){
                        item = response;
                        itemPath = path;
                        resolve(item);
                    })
                .catch(function(error){
                    item = null;
                    itemPath = "";
                    reject(error);
                });
            }); 
        }


        service.upload = function (file, path, fileName) {
            var token = null;

            try{
                var authInfo = authenticateSrvc.getAuthInfo();
                token = authInfo.access_token;
            }catch(e){
                // ignore this. Pass null to async function. Allow to fail there.
            }

            var uriStem = "https://graph.microsoft.com/v1.0/me/drive/root";

            var url = uriStem+":/"+path+"/"+fileName+":/content";//$stateParams.path;

            return new Promise(function (resolve, reject) {
                queryMetadata(token, uriStem)
                .then( function(){
                    var uploadRequest = new XMLHttpRequest(); //returns a XMLHttpRequest object
                    var mimeType = "text/plain"; //expecting to only upload CSV files  
                    uploadRequest.open('PUT', url, true);  // true : asynchrone false: synchrone
                    uploadRequest.setRequestHeader('Content-Type', mimeType);  
                    uploadRequest.setRequestHeader('Authorization', "bearer " + token);
                    uploadRequest.setRequestHeader('Permissions',"Delegated");
                    uploadRequest.send(file);
                
                    uploadRequest.addEventListener("readystatechange", processRequest, false);

                    function processRequest(e) {
                        if (uploadRequest.readyState == 4) { 
                            //var response = JSON.parse(uploadRequest.responseText);
                            if(uploadRequest.status == 200 || uploadRequest.status == 201)
                            {
                                resolve(uploadRequest.responseText);
                            }
                            else
                            {
                                reject("");
                            }
                        }
                    }
                })
            });
        }

        
        // ------------------------------------------------
        // ------------------------------------------------
        // UPOLAD FUNCTIONALITY
        // ------------------------------------------------
        // ------------------------------------------------

        service.createFolder = function(folderName, path){
            if (authenticateSrvc.getAuthInfo() == null) {
                alert("Please 'Authenticate'.");
            } else {
                //add check for bluetooth connection

                var token = null;

                try{
                    var authInfo = authenticateSrvc.getAuthInfo();
                    token = authInfo.access_token;
                }catch(e){
                    // ignore this. Pass null to async function. Allow to fail there.
                }    

                var folderDet = JSON.parse('{"name": "'+folderName+'", "folder": { }, "@microsoft.graph.conflictBehavior": "fail"}');
                //Allow it to fail, if the file is there, no need to make a new one.

                var url = "https://graph.microsoft.com/v1.0/me/drive/root:/"+path+"/"+folderName+":";

                return new Promise(function (resolve, reject) {
                    var uploadRequest = new XMLHttpRequest(); //returns a XMLHttpRequest object
                    var mimeType = "application/json";  
                    uploadRequest.open('PUT', url, true);  // true : asynchrone false: synchrone
                    uploadRequest.setRequestHeader('Content-Type', mimeType);  
                    uploadRequest.setRequestHeader('Authorization', "bearer " + token);
                    uploadRequest.send(JSON.stringify(folderDet));
                    uploadRequest.addEventListener("readystatechange", processRequest, false);

                    function processRequest(e) {
                        if (uploadRequest.readyState == 4){}
                        if(uploadRequest.status == 201 || uploadRequest.status == 200 || uploadRequest.status ==409) { //409 is a conflict error, it should be fine if this happens
                            resolve(uploadRequest.responseText);
                        }
                        else{
                            reject(uploadRequest.responseText);
                        }
                    }
                });
            }
        }


        service.getPath = function(){
            return itemPath;
        }

        service.getItem = function(){
            return item;
        }

        return service;

    }


})();