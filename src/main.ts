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
    const not = JSON.parse(JSON.stringify(jsonData))
    console.log('notificationOpenedCallback: ', JSON.stringify(not));
    if (!jsonData?.notification?.body?.includes('Carta') && 
    !jsonData?.notification?.body?.includes('remio') && 
    !jsonData?.notification?.body?.includes('renotazione')
    ) {
      (window as any)['destination'] = 'promotions';
      const event = new Event('notification');
      (window as any).dispatchEvent(event);
      const notIcon = document.getElementById('notification-page');
      console.log('notIcon', notIcon);
      console.log('1', (window as any)['destination']);
      if (notIcon) notIcon.click();
    }
  });

  (window as any).plugins.OneSignal.promptForPushNotificationsWithUserResponse((accepted: any) => {
      console.log("User accepted notifications: " + accepted);
  });
};

const DeepLinksInit = () => {
  console.log('DeepLinksInit INIT');
  const route = {
    '/m': {  target: 'businesses' },
    '/home': {  target: 'home' }
  };
  (window as any).IonicDeeplink.route(route, (match: any) => { console.log(match); alert('DeepLink! ' + match.$link.toString()); }, (nomatch: any) => { alert('NO DeepLink! ' + nomatch.$link.toString()) });
};

let waited = false;
const init = () => {
  console.log('INIT');
  if (typeof (window as any)['cordova'] !== 'undefined') {
    console.log('CORDOVA READY');
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
      bootstrap();
    }
  }
};




// document.addEventListener('deviceready', () => init(), false);



if (typeof (window as any)['cordova'] !== 'undefined') {
  (window as any).addEventListener('notification', (e: any) => { 
    const notIcon = document.getElementById('notification-page');
    console.log('2 notIcon', notIcon);
    if (notIcon) notIcon.click();
  }, false);
  document.addEventListener(
    'deviceready',
    () => {
      console.log('CORDOVA READY');
      window.open = (window as any)['cordova'].InAppBrowser?.open;
      if ((window as any)['MobileAccessibility']) {
        (window as any)['MobileAccessibility'].usePreferredTextZoom(false);
      }
      if ((window as any)['cordova'].MobileAccessibility) {
        (window as any)['cordova'].MobileAccessibility.usePreferredTextZoom(false);
      }
      bootstrap();
      OneSignalInit();
    },
    false
  );
} else {
  bootstrap();
}

