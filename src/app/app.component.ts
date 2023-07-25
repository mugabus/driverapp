/*
  Authors : initappz (Rahul Jograna)
  Website : https://initappz.com/
  App Name : Grocery Delivery App Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2023-present initappz.
*/
import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, Platform } from '@ionic/angular';
import { ApiService } from './services/api.service';
import { UtilService } from './services/util.service';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { App } from '@capacitor/app';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { StatusBar } from '@capacitor/status-bar';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages: any[] = [];
  selectedIndex: any;
  watchId: any;
  constructor(
    public util: UtilService,
    public api: ApiService,
    private platform: Platform,
    private router: Router,
    private alertController: AlertController,
    private zone: NgZone,
    private iab: InAppBrowser,
  ) {
    this.selectedIndex = 0;
    this.appPages = this.util.appPage;
    const language = localStorage.getItem('translateKey');
    if (language && language != null && language != 'null') {
      this.getByLanguagesID(language);
    } else {
      this.getDefaultSettings();
    }

    if (localStorage.getItem('uid') != null && localStorage.getItem('uid') && localStorage.getItem('uid') != '' && localStorage.getItem('uid') != 'null') {
      this.getUserByID();
      this.getLocationInfo();
    }

    const isPushNotificationsAvailable = Capacitor.isPluginAvailable('PushNotifications');
    if (isPushNotificationsAvailable) {
      const addListeners = async () => {
        await PushNotifications.addListener('registration', token => {
          console.info('Registration token: ', token.value);
          localStorage.setItem('pushToken', token.value);
          const uid = localStorage.getItem('uid');
          if (uid != null && uid && uid != '' && uid != 'null') {
            this.updateFCMToken();
          }
        });

        await PushNotifications.addListener('registrationError', err => {
          console.error('Registration error: ', err.error);
        });

        await PushNotifications.addListener('pushNotificationReceived', notification => {
          console.log('Push notification received: ', notification);
          this.presentAlertConfirm(notification.title, notification.body);
        });

        await PushNotifications.addListener('pushNotificationActionPerformed', notification => {
          console.log('Push notification action performed', notification.actionId, notification.inputValue);
        });
      }

      const registerNotifications = async () => {
        let permStatus = await PushNotifications.checkPermissions();

        if (permStatus.receive == 'prompt') {
          permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive != 'granted') {
          throw new Error('User denied permissions!');
        }

        await PushNotifications.register();
      }

      addListeners();
      registerNotifications().then(data => {
        console.log('registering data', data);
      }).catch((error: any) => {
        console.log('registering error', error);
      });
    }

    StatusBar.setBackgroundColor({ "color": '#587C1E' }).then((data: any) => {
      console.log('statusbar data', data);
    }, error => {
      console.log('statusbar color', error);
    }).catch((error: any) => {
      console.log('statusbar color', error);
    });

    this.platform.backButton.subscribe(async () => {
      console.log('Back Button --------------->>>', this.router.url, 'ad', this.router.isActive('/tabs/', true));

      if (this.router.url == '/tabs/categories' || this.router.url == '/tabs/cart' ||
        this.router.url == '/tabs/orders' || this.router.url == '/tabs/account'
        || this.router.url == '/login') {
        console.log('can close');
        this.util.navigateRoot('/tabs/home');
      } else if (this.router.url == '/tabs/home' || this.router.url == '/cities') {
        App.exitApp();
      }
    });
  }

  async presentAlertConfirm(title: any, body: any) {
    const alert = await this.alertController.create({
      header: this.util.translate('Notification'),
      subHeader: title,
      message: body,
      buttons: [
        {
          text: this.util.translate('Cancel'),
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: this.util.translate('Okay'),
          handler: () => {
            console.log('Confirm Okay');
          }
        }
      ]
    });

    await alert.present();
  }

  async updateApp(info: any) {
    try {
      console.log('update info', info);
      console.log('platform', this.platform.platforms());
      if (this.platform.is('ios') || this.platform.is('iphone') || this.platform.is('ipad')) {
        const data = await App.getInfo();
        console.log('iphone');
        if (info.app_version_ios != data.version) {
          if (info.force_update == '1' || info.force_update == 1) {
            this.updateForce(info.app_url_app_store);
          } else {
            this.optionalUpdate(info.app_url_app_store);
          }
        }
      } else if (this.platform.is('android')) {
        console.log('android');
        const data = await App.getInfo();
        console.log('app info', data);
        if (info.app_version_android != data.version) {
          if (info.force_update == '1' || info.force_update == 1) {
            this.updateForce(info.app_url_playstore);
          } else {
            this.optionalUpdate(info.app_url_playstore);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }

  }

  async updateForce(url: any) {
    const alert = await this.alertController.create({
      header: this.util.translate('Update'),
      message: this.util.translate('New update is available'),
      backdropDismiss: false,
      buttons: [
        {
          text: this.util.translate('Update Now'),
          id: 'confirm-button',
          handler: () => {
            console.log('Confirm Okay');
            this.iab.create(url, '_system');
          }
        }
      ]
    });

    await alert.present();
  }

  async optionalUpdate(url: any) {
    const alert = await this.alertController.create({
      header: this.util.translate('Update'),
      message: this.util.translate('New update is available'),
      buttons: [
        {
          text: this.util.translate('Update Later'),
          role: 'cancel',
          cssClass: 'secondary',
          id: 'cancel-button',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: this.util.translate('Update Now'),
          id: 'confirm-button',
          handler: () => {
            console.log('Confirm Okay');
            this.iab.create(url, '_system');
          }
        }
      ]
    });

    await alert.present();
  }

  getUserByID() {
    const body = {
      id: localStorage.getItem('uid')
    }
    this.api.post_private('v1/driver/byId', body).then((data: any) => {
      console.log(">>>>><<<<<", data);
      if (data && data.success && data.status == 200) {
        this.util.userInfo = data.data;
      } else {
        localStorage.removeItem('uid');
        localStorage.removeItem('token');
      }
    }, err => {
      localStorage.removeItem('uid');
      localStorage.removeItem('token');
      this.util.userInfo = null;
      console.log(err);
    }).catch((err) => {
      localStorage.removeItem('uid');
      localStorage.removeItem('token');
      this.util.userInfo = null;
      console.log(err);
    });
  }

  getLocationInfo() {
    const isLocationPlugin = Capacitor.isPluginAvailable('Geolocation');
    if (isLocationPlugin) {
      this.getPermission();
    }
  }

  async getPermission() {
    const permission = await Geolocation.checkPermissions();
    console.log(permission.location);
    if (permission && permission.location == 'granted') {
      this.getLocation();
    } else {
      const platform = Capacitor.getPlatform();
      console.log(platform);
      if (platform == 'web') {
        this.getWebLocationPermission();
      } else {
        this.askPermission();
      }
    }
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: this.util.translate('Permission Denied'),
      subHeader: this.util.translate('Location Error'),
      message: this.util.translate('Please enable location from App settings'),
      buttons: [
        {
          text: this.util.translate('Cancel'),
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel: blah');
          }
        },
        {
          text: this.util.translate('Okay'),
          handler: () => {
            console.log('Confirm Okay');
            this.getLocationInfo();
          }
        }
      ]
    });
    await alert.present();
  }

  report(message: any) {
    console.log(message);
  }

  async getLocation() {
    const coordinates = await Geolocation.getCurrentPosition();
    console.log(coordinates);
    if (coordinates && coordinates.coords && coordinates.coords) {
      this.watchPosition();
      this.updateLocations(coordinates.coords.latitude, coordinates.coords.longitude);
    }
  }

  async askPermission() {
    const permission = await Geolocation.requestPermissions();
    console.log(permission);
    if (permission && permission.location == 'granted') {
      this.getLocation();
    } else if (permission && permission.location == 'denied') {
      this.presentAlert();
    }
  }


  getWebLocationPermission() {
    navigator.permissions.query({
      name: 'geolocation'
    }).then((result) => {
      if (result.state == 'granted') {
        this.report(result.state);
      } else if (result.state == 'prompt') {
        this.report(result.state);
        navigator.geolocation.getCurrentPosition(position => {
          console.log(position);
          this.watchPosition();
          this.updateLocations(position.coords.latitude, position.coords.longitude);
        });
      } else if (result.state == 'denied') {
        this.report(result.state);
      }
      result.onchange = () => {
        this.report(result.state);
      }
    });
  }

  updateFCMToken() {
    const param = {
      id: localStorage.getItem('uid'),
      fcm_token: localStorage.getItem('pushToken') && localStorage.getItem('pushToken') != null ? localStorage.getItem('pushToken') : 'NA'
    }
    this.api.post_private('v1/drivers/edit_myProfile', param).then((data: any) => {
      console.log(data);
    }, error => {
      console.log(error);
    }).catch(error => {
      console.log(error);
    });
  }

  updateLocations(lat: any, lng: any) {
    this.util.myLat = lat;
    this.util.myLng = lng;
    const param = {
      id: localStorage.getItem('uid'),
      lat: lat,
      lng: lng
    }
    this.api.post_private('v1/drivers/edit_myProfile', param).then((data: any) => {
      console.log(data);
    }, error => {
      console.log(error);
    }).catch(error => {
      console.log(error);
    });
  }

  watchPosition() {
    try {
      this.watchId = Geolocation.watchPosition({}, (position, err) => {
        console.log('Watch', position);
        this.zone.run(() => {
          if (position && position.coords) {
            this.updateLocations(position.coords.latitude, position.coords.longitude);
          }

        });
      });
    } catch (e) {
      console.error(e);
    }
  }

  saveSettings(data: any) {
    const lang = data && data.data && data.data.language ? data.data.language : null;
    if (lang && lang != null) {
      this.util.translations = JSON.parse(lang.content);
      localStorage.setItem('translateKey', lang.id);
    }
    const settings = data && data.data && data.data.settings ? data.data.settings : null;
    if (settings) {
      this.util.appLogo = settings.logo;
      this.util.direction = settings.appDirection;
      this.util.app_status = settings.app_status == 1 ? true : false;
      this.util.app_color = settings.app_color;
      this.util.findType = settings.findType;
      this.util.login_style = settings.login_style;
      this.util.register_style = settings.register_style;
      this.util.currecny = settings.currencySymbol;
      this.util.cside = settings.currencySide;
      this.util.makeOrders = settings.makeOrders;
      this.util.smsGateway = settings.sms_name;
      this.util.user_login_with = settings.driver_login;
      this.util.user_verification = settings.user_verify_with;
      this.util.reset_pwd = settings.reset_pwd;
      this.util.delivery = settings.delivery;
      // this.theme.setTheme({
      //   primary: this.util.app_color,
      //   secondary: '#0000FF',
      // });
      localStorage.setItem('theme', 'primary');
      if (((x) => { try { JSON.parse(x); return true; } catch (e) { return false } })(settings.country_modal)) {
        this.util.countrys = JSON.parse(settings.country_modal);
      }
      this.util.default_country_code = settings && settings.default_country_code ? settings.default_country_code : '91';
      document.documentElement.dir = this.util.direction;
    }

    const general = data && data.data && data.data.general ? data.data.general : null;
    if (general) {
      this.util.appName = general.name;
      this.util.general = general;
    }

    const served = data && data.data && data.data.we_served ? data.data.we_served : null;
    if (served) {
      this.util.servingCities = served;
    }

    const appUpdate = data && data.data && data.data.appUpdates ? data.data.appUpdates : null;
    if (appUpdate) {
      try {
        const appUpdateData = JSON.parse(appUpdate.value);
        console.log(appUpdateData);
        const currentApp = appUpdateData.filter((x: any) => x.app_name == 'Driver App');
        console.log('-> current App', currentApp);
        this.updateApp(currentApp[0]);
      } catch (error) {
        console.log(error);
      }
    }

    console.log(this.util);
    // this.util.navigateRoot('');
  }
  getByLanguagesID(languageId: any) {
    this.api.post_public('v1/settings/getByLanguageId', { id: languageId }).then((data: any) => {
      console.log('settings by id', data);
      if (data && data.status && data.status == 200) {
        this.saveSettings(data);
      } else {
        this.util.navigateRoot('api-error');
      }
    }, error => {
      console.log(error);
      this.util.apiErrorHandler(error);
      this.util.navigateRoot('api-error');
    }).catch(error => {
      console.log(error);
      this.util.apiErrorHandler(error);
      this.util.navigateRoot('api-error');
    });
  }

  getDefaultSettings() {
    this.api.get_public('v1/settings/getDefault').then((data: any) => {
      console.log('default settings', data);
      if (data && data.status && data.status == 200) {
        this.saveSettings(data);
      } else {
        this.util.navigateRoot('api-error');
      }
    }, error => {
      console.log(error);
      this.util.apiErrorHandler(error);
      this.util.navigateRoot('api-error');
    }).catch(error => {
      console.log(error);
      this.util.apiErrorHandler(error);
      this.util.navigateRoot('api-error');
    });
  }

  getTranslate(str: any) {
    return this.util.translate(str);
  }

  haveSignedIn() {
    const uid = localStorage.getItem('uid');
    if (uid && uid != null && uid != 'null') {
      return true;
    }
    return false;
  }

  logout() {
    this.util.show();
    this.api.post_private('v1/auth/logout', {}).then((data: any) => {
      this.util.hide();
      console.log(data)
      localStorage.removeItem('uid');
      localStorage.removeItem('token');
      this.util.navigateRoot('/tabs/home');
    }, error => {
      this.util.hide();
      console.log(error);
      this.util.apiErrorHandler(error);
    }).catch(error => {
      this.util.hide();
      console.log(error);
      this.util.apiErrorHandler(error);
    });

  }
}
