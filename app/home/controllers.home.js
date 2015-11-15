'use strict';

angular.module('app.controllers.home', [])

    .controller('HomeController', function ($scope, $sce, $timeout) {

        Parse.initialize("lwLYLxwkUelHTA6BKBAPHMOdq04rKgbRfZnUeT4Q", "asJdx21zX0nHNCZ59CePFR79M0CEQBj9vS9jlbD4");
        var ParseImage = Parse.Object.extend("Image");

        var SnapCanvas = Snap("#svg_profile_pic");
        var profile_picture_svg_img,
            currentOverlay;

        $scope.overlays = [
            {
                src: "assets/filter.png",
                title: "Paris Attacks",
                htmlDescription: $sce.trustAsHtml("This is a description <br> describing somthing")
            },
            {
                src: "assets/blm.png",
                title: "Black Lives Matter",
                htmlDescription: $sce.trustAsHtml("This is a description <br> describing somthing")
            },
            {
                src: "assets/japan.png",
                title: "Wale Crisis",
                htmlDescription: $sce.trustAsHtml("This is a description <br> describing somthing")
            }
        ];

        $scope.getPicture = function() {
            console.log("Getting Picture");
            FB.api('/me/picture', {width: 500, height: 500}, function (response) {
                console.log(response);
                $scope.profile_picture = response.data.url;

                var profile_picture_img = angular.element("#profile_pic");
                profile_picture_img.attr("src", $scope.profile_picture);

            });
        };

        function resize(){
            var w = $('body').width()*.35;
            $('#canvas, #profile_pic').attr("width", w);
            $("#canvas, #profile_pic").attr("height", w);

            if(currentOverlay != null){
                $scope.selectFilter(currentOverlay);
            }

            console.log(currentOverlay);
        }

        angular.element(window).on("resize", function(){
            resize();
        });

        resize();

        $scope.selectFilter = function(i) {
            currentOverlay = i;
            $scope.currentOverlay = currentOverlay;

            var overlay = $scope.overlays[i];

                var canvas = $('#canvas'),
                    context = canvas[0].getContext('2d');

                var base_image = new Image();
                base_image.crossOrigin = "Anonymous";
                base_image.src = $scope.profile_picture;
                base_image.onload = function(){

                    var w = canvas.width();
                    var h = canvas.height();
                    context.drawImage(base_image, 0, 0, w, h);

                    var overlay_image = new Image();
                    overlay_image.crossOrigin = "Anonymous";
                    overlay_image.src = overlay.src;
                    overlay_image.onload = function(){
                        context.drawImage(overlay_image, 0, 0, w, h);
                    };

                };


        };

        $scope.status = false;

        $scope.complete = function() {

            $scope.status = "pending";

            var canvas = document.getElementById('canvas');

            var newCanvas = document.createElement('canvas'),
                context = newCanvas.getContext('2d');

            newCanvas.setAttribute("height", 500);
            newCanvas.setAttribute("width", 500);
            context.drawImage(canvas, 0, 0, 500, 500);

            var image_data = newCanvas.toDataURL("image/jpeg", 1.0);
            var file = new Parse.File("image.jpeg", {base64: image_data}, "image/jpeg");

            console.log(canvas.toDataURL());

            file.save().then(function() {

                var image = new ParseImage();
                image.set("img", file);
                console.log(image);

                image.save().then(function(){
                    console.log("Saved Image to Parse");
                    var profileImage = image.get("img");
                    console.log(profileImage.url());

                    FB.api('/me/photos', 'post', {url: profileImage.url()}, function (response) {
                        if(response.id){
                            console.log("Uploaded Image to Facebook");
                            $scope.status = "redirecting";
                            $timeout(function(){
                                window.location = "https://www.facebook.com/photo.php?fbid="+response.id+"&makeprofile=1";
                            }, 2500);
                        }
                    });

                });

            }, function(error) {
                console.log(error);
            });

        };

        /***********FACEBOOK****************/

        function statusChangeCallback(response) {
            console.log('statusChangeCallback');
            console.log(response);

            if (response.status === 'connected') {
                // Logged into your app and Facebook.
                $scope.getPicture();
            } else if (response.status === 'not_authorized') {
                // The person is logged into Facebook, but not your app.
            } else {
                // The person is not logged into Facebook, so we're not sure if
                // they are logged into this app or not.
            }
        }

        function checkLoginState() {
            FB.getLoginStatus(function(response) {
                statusChangeCallback(response);
            });
        }

        window.fbAsyncInit = function() {
            FB.init({
                appId      : '1673490829554193',
                cookie     : true,  // enable cookies to allow the server to access
                                    // the session
                xfbml      : true,  // parse social plugins on this page
                version    : 'v2.2' // use version 2.2
            });

            FB.getLoginStatus(function(response) {
                statusChangeCallback(response);
            });

        };

        // Load the SDK asynchronously
        (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));

        function testAPI() {
            console.log('Welcome!  Fetching your information.... ');
            FB.api('/me', function(response) {
                console.log('Successful login for: ' + response.name);
                document.getElementById('status').innerHTML =
                    'Thanks for logging in, ' + response.name + '!';
            });
        }

    });