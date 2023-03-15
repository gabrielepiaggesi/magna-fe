let platform: any;

function onError(error: any) {
    console.error("The following error occurred: " + error);
}

function handleLocationAuthorizationStatus(status: any) {
    switch (status) {
        case (window as any).cordova.plugins.diagnostic.permissionStatus.GRANTED:
            if(platform === "ios"){
                onError("Location services is already switched ON");
            }else{
                _makeRequest();
            }
            break;
        case (window as any).cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
            requestLocationAuthorization();
            break;
        case (window as any).cordova.plugins.diagnostic.permissionStatus.DENIED:
            if(platform === "android"){
                onError("User denied permission to use location");
            }else{
                _makeRequest();
            }
            break;
        case (window as any).cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS:
            // Android only
            onError("User denied permission to use location");
            break;
        case (window as any).cordova.plugins.diagnostic.permissionStatus.GRANTED_WHEN_IN_USE:
            // iOS only
            onError("Location services is already switched ON");
            break;
    }
}

function requestLocationAuthorization() {
    (window as any).cordova.plugins.diagnostic.requestLocationAuthorization(handleLocationAuthorizationStatus, onError);
}

function requestLocationAccuracy() {
    (window as any).cordova.plugins.diagnostic.getLocationAuthorizationStatus(handleLocationAuthorizationStatus, onError);
}

function _makeRequest(){
    (window as any).cordova.plugins.locationAccuracy.canRequest(function(canRequest: any){
        if (canRequest) {
            (window as any).cordova.plugins.locationAccuracy.request(function () {
                    // handleSuccess("Location accuracy request successful");
                    alert('Location accuracy request successful')
                }, function (error: any) {
                    onError("Error requesting location accuracy: " + JSON.stringify(error));
                    if (error) {
                        // Android only
                        onError("error code=" + error.code + "; error message=" + error.message);
                        if (platform === "android" && error.code !== (window as any).cordova.plugins.locationAccuracy.ERROR_USER_DISAGREED) {
                            if (window.confirm("Failed to automatically set Location Mode to 'High Accuracy'. Would you like to switch to the Location Settings page and do this manually?")) {
                                (window as any).cordova.plugins.diagnostic.switchToLocationSettings();
                            }
                        }
                    }
                }, (window as any).cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY // iOS will ignore this
            );
        } else {
            // On iOS, this will occur if Location Services is currently on OR a request is currently in progress.
            // On Android, this will occur if the app doesn't have authorization to use location.
            onError("Cannot request location accuracy");
        }
    });
}

// Make the request
export const tryRequestLocation = () => {
    platform = (window as any).cordova.platformId;
    (window as any).cordova.plugins.diagnostic.isGpsLocationAvailable((s: any) => console.log('isGpsLocationAvailable YES', s), (s: any) => console.log('isGpsLocationAvailable NO', s));
    (window as any).cordova.plugins.diagnostic.isGpsLocationEnabled((s: any) => console.log('isGpsLocationEnabled YES', s), (s: any) => console.log('isGpsLocationEnabled NO', s));
    requestLocationAccuracy();
}