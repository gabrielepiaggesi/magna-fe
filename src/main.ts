import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

const bootstrap = () => {
  console.log('BOOTSTRAP');
  platformBrowserDynamic().bootstrapModule(AppModule);
};

const startNotificationListener = () => {
  console.log('NOTIFICATION INIT');
  (window as any).addEventListener('notification', (e: any) => { 
    const notIcon = document.getElementById('notification-page');
    console.log('2 notIcon', notIcon);
    if (notIcon) notIcon.click();
  }, false);
};

const startCordovaSettings = () => {
  console.log('CORDOVA INIT');
  window.open = (window as any)['cordova'].InAppBrowser?.open;
  if ((window as any)['MobileAccessibility']) {
    (window as any)['MobileAccessibility'].usePreferredTextZoom(false);
  }
  if ((window as any)['cordova'].MobileAccessibility) {
    (window as any)['cordova'].MobileAccessibility.usePreferredTextZoom(false);
  }
};

const OneSignalInit = () => {
  console.log('ONESIGNAL INIT');
  // NOTE: Update the setAppId value below with your OneSignal AppId.
  (window as any).plugins.OneSignal.setAppId("adee7a5c-4bb2-456f-b550-e0c2a5472f54");
  (window as any).plugins.OneSignal.setNotificationOpenedHandler((jsonData: any) => {
    const not = JSON.parse(JSON.stringify(jsonData));
    console.log('notificationOpenedCallback: ', JSON.stringify(not));
    const notType = jsonData?.notification?.additionalData?.type;

    if (notType == 'promotion') {
      (window as any)['destination'] = 'promotions';
      const event = new Event('notification');
      (window as any).dispatchEvent(event);
      const notIcon = document.getElementById('notification-page');
      if (notIcon) notIcon.click();
    }
    if (notType == 'user-card-scan' || notType == 'user-discount' || notType == 'user-card-geo') {
      const event = new Event('refreshList');
      (window as any).dispatchEvent(event);
      (window as any)['refreshList'] = true;
    }
    if (notType == 'user-reservation') {
      const event = new Event('reservation');
      (window as any).dispatchEvent(event);
      const notIcon = document.getElementById('reserv-page');
      if (notIcon) notIcon.click();
    }
  });

  (window as any).plugins.OneSignal.setNotificationWillShowInForegroundHandler((notificationReceivedEvent: any) => {
    const not = notificationReceivedEvent.getNotification();
    let not2 = JSON.parse(JSON.stringify(not));
    const notType = not2?.additionalData?.type;

    if (notType == 'user-card-scan' || notType == 'user-discount') {
      const event1 = new Event('refreshList');
      (window as any).dispatchEvent(event1);
      (window as any)['refreshList'] = true;
      console.log('REFRESH LIST', (window as any)['refreshList']);
      const event2 = new Event('fidelityCardEvent');
      (window as any).dispatchEvent(event2);
    }
    if (notType == 'user-card-no-points') {
      const event1 = new Event('refreshList');
      (window as any).dispatchEvent(event1);
      (window as any)['refreshList'] = true;
      const event2 = new Event('noPointsAddedEvent');
      (window as any).dispatchEvent(event2);
    }
    if (notType == 'user-card-geo') {
      const event1 = new Event('refreshList');
      (window as any).dispatchEvent(event1);
      (window as any)['refreshList'] = true;
      const event2 = new Event('fidelityCardGeoEvent');
      (window as any).dispatchEvent(event2);
    }
    notificationReceivedEvent.complete(notificationReceivedEvent.getNotification());
  });

  (window as any).plugins.OneSignal.promptForPushNotificationsWithUserResponse((accepted: any) => {
      console.log("User accepted notifications: " + accepted);
  });
};

const DeepLinksInit = () => {
  console.log('DeepLinksInit INIT');
  (window as any)['goToBusinessId'] = 0;
  const route = {
    '/m': {  target: 'businesses' },
    '/home': {  target: 'home' },
    '/': {  target: 'home' }
  };
  (window as any).IonicDeeplink.route(route, 
    (match: any) => { 
      console.log(match); 
      // alert('DeepLink! ' + match.$link.toString()); 
      const args = match.$args;
      if (args && args.businessId && args.businessId > 0) {
        (window as any)['goToBusinessId'] = args.businessId;
        const goToBusinessEvent = new Event('goToBusiness');
        (window as any).dispatchEvent(goToBusinessEvent);
      }
    }, 
    (nomatch: any) => { 
      console.log('NO DeepLink! ' + nomatch.$link.toString()) 
    }
  );
};

const SmartLookInit = () => {
  console.log('SmartLookInit INIT');
  (window as any).SmartlookPlugin.setupAndStartRecording({smartlookAPIKey: "93293864cd3382e641ec721bdaf46817c857740d"});
  // (window as any).Smartlook.setProjectKey({key: "93293864cd3382e641ec721bdaf46817c857740d"});
  // (window as any).Smartlook.start();
};

const BackButtonStrategy = () => {
  // document.addEventListener('backbutton', (e: any) => {
  //   console.log('GOING BACK 1');
  //   const event = new Event('backButton');
  //   (window as any).dispatchEvent(event);
  //   e.preventDefault();
  // }, false);
};

let waited = false;
const init = () => {
  console.log('INIT');
  (window as any)['refreshList'] = false;
  if (typeof (window as any)['cordova'] !== 'undefined') {
    console.log('CORDOVA READY');
    BackButtonStrategy();
    bootstrap();
    startNotificationListener();
    startCordovaSettings();
    DeepLinksInit();
    OneSignalInit();
  } else {
    console.error('CORDOVA NOT READY');
    if (!waited) {
      waited = true;
      console.log('WAITING...', waited);
      setTimeout(() => init(), 1000);
    } else {
      console.error('FAIL');
      BackButtonStrategy();
      bootstrap();
    }
  }
};




document.addEventListener('deviceready', () => init(), false);



// if (typeof (window as any)['cordova'] !== 'undefined') {
//   (window as any).addEventListener('notification', (e: any) => { 
//     const notIcon = document.getElementById('notification-page');
//     console.log('2 notIcon', notIcon);
//     if (notIcon) notIcon.click();
//   }, false);
//   document.addEventListener(
//     'deviceready',
//     () => {
//       console.log('CORDOVA READY');
//       window.open = (window as any)['cordova'].InAppBrowser?.open;
//       if ((window as any)['MobileAccessibility']) {
//         (window as any)['MobileAccessibility'].usePreferredTextZoom(false);
//       }
//       if ((window as any)['cordova'].MobileAccessibility) {
//         (window as any)['cordova'].MobileAccessibility.usePreferredTextZoom(false);
//       }
//       BackButtonStrategy();
//       bootstrap();
//       OneSignalInit();
//     },
//     false
//   );
// } else {
//   BackButtonStrategy();
//   bootstrap();
// }

