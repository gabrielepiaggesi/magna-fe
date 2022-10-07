import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

// platformBrowserDynamic()
//   .bootstrapModule(AppModule)
//   .catch((err) => console.error(err));

const bootstrap = () => {
  platformBrowserDynamic().bootstrapModule(AppModule);
};

if (typeof (window as any)['cordova'] !== 'undefined') {
  document.addEventListener(
    'deviceready',
    () => {
      console.log('CORDOVA READY');
      window.open = (window as any)['cordova'].InAppBrowser?.open;
      bootstrap();
      OneSignalInit();
    },
    false
  );
} else {
  bootstrap();
}


const OneSignalInit = () => {
    // Uncomment to set OneSignal device logging to VERBOSE  
    // window.plugins.OneSignal.setLogLevel(6, 0);
    
    // NOTE: Update the setAppId value below with your OneSignal AppId.
    (window as any).plugins.OneSignal.setAppId("adee7a5c-4bb2-456f-b550-e0c2a5472f54");
    (window as any).plugins.OneSignal.setNotificationOpenedHandler((jsonData: any) => {
        console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData));
    });
    
    //Prompts the user for notification permissions.
    //    * Since this shows a generic native prompt, we recommend instead using an In-App Message to prompt for notification permission (See step 6) to better communicate to your users what notifications they will get.
    (window as any).plugins.OneSignal.promptForPushNotificationsWithUserResponse((accepted: any) => {
        console.log("User accepted notifications: " + accepted);
    });
}

