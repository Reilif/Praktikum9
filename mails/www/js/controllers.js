angular.module('starter.controllers', [])
    .factory('Mail', function ($http) {
        var items = [];
        return {
            getFolders: function () {
                return $http.get('http://localhost:8080/api/folder');
            },
            selectFolder: function (folder) {
                return $http.get('http://localhost:8080/api/folder/' + folder);
            },
            selectMail: function (mail) {
                return $http.get('http://localhost:8080/api/msg/' + mail._id);
            },
            deleteMail: function (mail) {
                return $http.delete('http://localhost:8080/api/msg/' + mail._id);
            },
            deleteFolder: function (folder) {
                return $http.delete('http://localhost:8080/api/folder/' + folder);
            },
            renameFolder: function (folder, newName) {
                return $http.put('http://localhost:8080/api/folder/' + folder, {newval: newName});
            },
            moveFolder: function (mail, newName) {
                return $http.put('http://localhost:8080/api/msg/' + mail._id, {folder: newName});
            },
            newMail: function (mail) {
                var recipients = mail.rec.split(';');
                var paras = {
                    sender: mail.sender,
                    recipients: recipients,
                    text: mail.text,
                    subject: mail.subject,
                    date: mail.date,
                    folder: mail.folder
                };
                console.log(paras);
                return $http.post('http://localhost:8080/api/msg', paras);
            }

        };
    }).

    controller('PostsCtrl', function ($scope, $http, Mail, $ionicModal) {
        $scope.ps = Mail;
        $http.defaults.headers.common["X-Custom-Header"] = "Angular.js";
        $scope.selectedFolder = null;
        $scope.selectedMail = null;
        $scope.folderOperations = true;
        $scope.mailOperations = true;

        Mail.getFolders().
            success(function (data, status, headers, config) {
                $scope.folders = data;
            });

        $scope.selectFolder = function (folder) {
            $scope.selectedFolder = folder;
            Mail.selectFolder(folder).
                success(function (data, status, headers, config) {
                    $scope.mails = data;
                });
            if ($scope.selectedFolder === null) {
                $scope.folderOperations = true;
            } else {
                $scope.folderOperations = false;
            }
            console.log(folder);
        };


        $scope.selectMail = function (mail) {
            $scope.detailMail = null;

            if (!mail) {
                $scope.selectedMail = null;

            } else {
                Mail.selectMail(mail).
                    success(function (data, status, headers, config) {
                        $scope.detailMail = data;
                        console.log(data);
                    });
            }
            if ($scope.selectedMail === null) {
                $scope.mailOperations = true;
            } else {
                $scope.mailOperations = false;
            }
        };

        $scope.deleteMail = function (mail) {

            Mail.deleteMail(mail).
                success(function (data, status, headers, config) {
                    $scope.selectFolder($scope.selectedFolder);
                    $scope.selectMail(null);
                });
        };

        $scope.deleteFolder = function (folder) {
            Mail.deleteFolder(folder).
                success(function (data, status, headers, config) {
                    Mail.getFolders().
                        success(function (data, status, headers, config) {
                            $scope.folders = data;
                            $scope.selectFolder(null);
                        });
                });
        };

        // Create the login modal that we will use later
        $ionicModal.fromTemplateUrl('templates/login.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.modalRename = modal;

            // Triggered in the login modal to close it
            $scope.modalRename.closeLogin = function () {
                $scope.modalRename.hide();
            };

            // Perform the login action when the user submits the login form
            $scope.modalRename.okRename = function () {
                console.log("Neuer Name:" + $scope.modalRename.newName);
                console.log("Zielordner:" + $scope.modalRename.folder);
                Mail.renameFolder($scope.modalRename.folder, $scope.modalRename.newName).success(function (data, status, headers, config) {
                    $scope.modalRename.closeLogin();
                    Mail.getFolders().
                        success(function (data, status, headers, config) {
                            $scope.folders = data;
                            $scope.selectFolder($scope.modalRename.newName);
                        });

                });
            };

        });


        // Open the login modal
        $scope.showRename = function (folder) {
            $scope.modalRename.folder = folder;
            $scope.modalRename.newName = folder;
            $scope.modalRename.show();
        };


        // Create the login modal that we will use later
        $ionicModal.fromTemplateUrl('templates/move.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.modalMove = modal;

            // Triggered in the login modal to close it
            $scope.modalMove.closeMove = function () {
                $scope.modalMove.hide();
            };

            // Perform the login action when the user submits the login form
            $scope.modalMove.okMove = function () {
                console.log("Neuer Ordner:" +$scope.modalMove.newName);
                console.log("Zielmail:" + $scope.modalMove.mail);
                Mail.moveFolder($scope.modalMove.mail, $scope.modalMove.newName).success(function (data, status, headers, config) {
                    $scope.modalRename.closeMove();
                    Mail.getFolders().
                        success(function (data, status, headers, config) {
                            $scope.folders = data;
                            $scope.selectFolder($scope.modalMove.newName);
                        });
                });
            };


        });


        // Open the login modal
        $scope.showMove = function (mail) {
            $scope.modalMove.mail = mail;
            $scope.modalMove.show();
        };


        // Create the login modal that we will use later
        $ionicModal.fromTemplateUrl('templates/newMail.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.modalNew = modal;
            $scope.modalNew.newMail = {};
            // Triggered in the login modal to close it
            $scope.modalNew.closeNew = function () {
                $scope.modalNew.hide();
            };

            // Perform the login action when the user submits the login form
            $scope.modalNew.okNew = function () {
                console.log($scope.modalNew.newMail);
                Mail.newMail($scope.modalNew.newMail).
                    success(function (data, status, headers, config) {
                        $scope.modalNew.closeNew();
                        $scope.selectFolder($scope.modalNew.newMail.folder);
                    });
            };


        });


        // Open the login modal
        $scope.showNewMail = function (mail) {
            $scope.modalNew.show();
        };

    })
    .
    controller('RenameCtrl', function ($scope, $modal, $modalInstance) {

        $scope.okRename = function () {
            $modalInstance.close($scope.newFoldername);
        };

        $scope.closeRename = function () {
            $modalInstance.dismiss();
        };
    }).
    controller('MoveCtrl', function ($scope, $modal, $modalInstance, Mail) {

        $scope.okMove = function () {
            $modalInstance.close($scope.moveNewFolder);
        };

        $scope.closeMove = function () {
            $modalInstance.dismiss();
        };
    }).
    controller('NewMailCtrl', function ($scope, $modal, $modalInstance, Mail) {
        $scope.okNewMail = function () {
            $modalInstance.close($scope.newmail);
        };

        $scope.closeNewMail = function () {
            $modalInstance.dismiss();
        };
    })


    .controller('AppCtrl', function ($scope, $ionicModal, $timeout) {
    })
