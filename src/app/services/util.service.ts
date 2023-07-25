/*
  Authors : initappz (Rahul Jograna)
  Website : https://initappz.com/
  App Name : Grocery Delivery App Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2023-present initappz.
*/
import { Injectable, NgZone } from '@angular/core';
import { LoadingController, AlertController, ToastController, NavController, MenuController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UtilService {
  isLoading = false;
  public translations: any[] = [];
  public default_country_code: any = '';
  public user_verification: any = 0;
  public themeColor = [
    { name: 'Default', class: 'default' },
    { name: 'Dark', class: 'dark-theme' },
  ];
  public findType: any = 0;
  public userInfo: any;
  public general: any;
  public cside: any = 'left';
  public currecny: any = '$';
  public appName: any;
  public appLogo: any;
  public direction: any;
  public show_booking: boolean = true;
  public app_color: any;
  public app_status: boolean = true;
  public app_closed_message: any = '';
  private offerAdded = new Subject<any>();
  private newAddress = new Subject<any>();
  private typeChanged = new Subject<any>();
  public settingInfo: any;
  public adminInfo: any;
  public diningInformations: any;
  public appClosedMessage: any = '';
  orderStatus = [
    'Created',
    'Accepted',
    'Prepared',
    'Ongoing',
    'Delivered',
    'Pending Payments',
    'Cancelled',
    'Refunded',
    'Rejected'
  ];
  paidMethods = [
    'Index',
    'COD',
    'STRIPE',
    'PAYPAL',
    'PAYTM',
    'RAZORPAY',
    'INSTAMOJO',
    'PAYSTACK',
    'FLUTTERWAVE',
    'PAYKUN'
  ];
  private orderChange = new Subject<any>();
  public loggedIN: boolean = false;
  public home_style: any = 1;
  public countrys: any[] = [];
  public smsGateway: any = '0';
  public login_style: any = 3;
  public user_login_with: any = 0;
  public register_style: any = 3;
  public servingCities: any[] = [];
  public cityName: any = '';
  public cityId: any = '';
  public zipcode: any = '';
  public deliveryAddress: any = '';
  public active_store: any[] = [];
  public favIds: any[] = [];
  public newOrder = new Subject<any>();
  public makeOrders: any = 0;
  public reset_pwd: any = 0;
  public appPage: any[] = [];
  public haveFav: boolean;
  public delivery: any = 1;
  public myLat: any;
  public myLng: any;
  constructor(
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private navCtrl: NavController,
    private menuCtrl: MenuController,
    private router: Router,
    private zone: NgZone
  ) {
    this.appPage = [
      {
        title: 'Home',
        url: 'tabs/home',
        icn: 'home-outline'
      },
      {
        title: 'History',
        url: 'tabs/orders',
        icn: 'document-text-outline'
      },
      {
        title: 'Profile',
        url: 'tabs/account',
        icn: 'person-outline'
      },
      {
        title: 'Language',
        url: 'languages',
        icn: 'language-outline'
      },
      {
        title: 'Contact us',
        url: 'tabs/account/contacts',
        icn: 'mail-outline'
      },
      {
        title: 'Chats',
        url: 'chats',
        icn: 'chatbubbles-outline'
      },
      {
        title: 'Wallet',
        url: 'tabs/account/wallet',
        icn: 'wallet-outline'
      },
      {
        title: 'Refer & Earn',
        url: 'tabs/account/referral',
        icn: 'gift-outline'
      },
    ];
  }

  navigateToPage(routes: any, param?: any) {
    this.zone.run(() => {
      console.log(routes, param);
      this.router.navigate([routes], param);
    });
  }

  publishNewAddress() {
    this.newAddress.next(0);
  }

  publishNewOrder() {
    this.newOrder.next(0);
  }

  subscribeOrder(): Subject<any> {
    return this.newOrder;
  }

  subscribeNewAddress(): Subject<any> {
    return this.newAddress;
  }

  navigateRoot(routes: any) {
    this.zone.run(() => {
      this.navCtrl.navigateRoot([routes]);
    });
  }

  orderChanged() {
    this.orderChange.next(0);
  }

  getKeys(key: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      resolve(localStorage.getItem(key))
    });
  }

  clearKeys(key: any) {
    // this.storage.remove(key);
    localStorage.removeItem(key);
  }

  setKeys(key: any, value: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      resolve(localStorage.setItem(key, value));
    });
  }

  retriveChanges(): Subject<any> {
    return this.orderChange;
  }

  onTypeChanged() {
    this.typeChanged.next(0);
  }

  getTypeChanged(): Subject<any> {
    return this.typeChanged;
  }

  translate(str: any) {
    if (this.translations[str]) {
      return this.translations[str];
    }
    return str;
  }

  publishOffers() {
    this.offerAdded.next(0);
  }

  subscribeOffers(): Subject<any> {
    return this.offerAdded;
  };

  openMenu() {
    this.menuCtrl.open();
  }

  setFav(id: any) {
    this.favIds.push(id);
  }

  removeFav(id: any) {
    this.favIds = this.favIds.filter(x => x != id);
  }

  async show(msg?: any) {
    this.isLoading = true;
    return await this.loadingCtrl.create({
      message: this.translate(msg),
      spinner: 'bubbles',
    }).then(a => {
      a.present().then(() => {
        //console.log('presented');
        if (!this.isLoading) {
          a.dismiss().then(() => console.log('abort presenting'));
        }
      });
    });
  }

  async hide() {
    this.isLoading = false;
    return await this.loadingCtrl.dismiss().then(() => console.log('dismissed'));
  }

  /*
    Show Warning Alert Message
    param : msg = message to display
    Call this method to show Warning Alert,
    */
  async showWarningAlert(msg: any) {
    const alert = await this.alertCtrl.create({
      header: this.translate('Warning'),
      message: msg,
      buttons: [this.translate('OK')]
    });

    await alert.present();
  }

  async showSimpleAlert(msg: any) {
    const alert = await this.alertCtrl.create({
      header: '',
      message: msg,
      buttons: [this.translate('OK')]
    });

    await alert.present();
  }

  /*
   Show Error Alert Message
   param : msg = message to display
   Call this method to show Error Alert,
   */
  async showErrorAlert(msg: any) {
    const alert = await this.alertCtrl.create({
      header: this.translate('Error'),
      message: msg,
      buttons: [this.translate('OK')]
    });

    await alert.present();
  }

  /*
     param : email = email to verify
     Call this method to get verify email
     */
  async getEmailFilter(email: any) {
    const emailfilter = /^[\w._-]+[+]?[\w._-]+@[\w.-]+\.[a-zA-Z]{2,6}$/;
    if (!(emailfilter.test(email))) {
      const alert = await this.alertCtrl.create({
        header: this.translate('Warning'),
        message: this.translate('Please enter valid email'),
        buttons: [this.translate('OK')]
      });
      await alert.present();
      return false;
    } else {
      return true;
    }
  }


  /*
    Show Toast Message on Screen
     param : msg = message to display, color= background
     color of toast example dark,danger,light. position  = position of message example top,bottom
     Call this method to show toast message
     */

  async showToast(msg: any, colors: any, positon: any) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      color: colors,
      position: positon
    });
    toast.present();
    await Haptics.impact({ style: ImpactStyle.Medium });
  }

  async shoNotification(msg: any, colors: any, positon: any) {
    const toast = await this.toastCtrl.create({
      message: this.translate(msg),
      duration: 4000,
      color: colors,
      position: positon,
      buttons: [
        {
          text: this.translate('OK'),
          role: 'cancel',
          handler: () => {
            // console.log('Cancel clicked');
          }
        }
      ]
    });
    toast.present();
    await Haptics.impact({ style: ImpactStyle.Medium });
  }

  async errorToast(msg: any, color?: any) {
    const toast = await this.toastCtrl.create({
      message: this.translate(msg),
      duration: 2000,
      color: color ? color : 'dark'
    });
    toast.present();
    await Haptics.impact({ style: ImpactStyle.Medium });

  }

  onBack() {
    this.navCtrl.back();
  }

  apiErrorHandler(err: any) {
    if (err && err.status == 401 && err.error.error) {
      this.errorToast(err.error.error);
      this.navCtrl.navigateRoot('/login');
      return false;
    }
    if (err && err.status == 500 && err.error.error) {
      this.errorToast(err.error.error);
      return false;
    }
    if (err.status == -1) {
      this.errorToast('Failed To Connect With Server');
    } else if (err.status == 401) {
      this.errorToast('Unauthorized Request!');
      localStorage.removeItem('token');
      localStorage.removeItem('uid');
      this.navCtrl.navigateRoot('/login');
    } else if (err.status == 500) {
      this.errorToast('Something went wrong');
    } else if (err.status == 422 && err.error.error) {
      this.errorToast(err.error.error);
    } else {
      this.errorToast('Something went wrong');
    }

  }

  // setDetails(data) {
  //   this.details = null;
  //   this.details = data;
  // }
  // getDetails() {
  //   return this.details;
  // }

  makeid(length: any) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  public loadScript(url: string) {
    const body = <HTMLDivElement>document.body;
    const script = document.createElement('script');
    script.innerHTML = '';
    script.src = url;
    script.async = false;
    script.defer = true;
    body.appendChild(script);
  }
}
