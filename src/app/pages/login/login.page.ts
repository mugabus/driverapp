/*
  Authors : initappz (Rahul Jograna)
  Website : https://initappz.com/
  App Name : Grocery Delivery App Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2023-present initappz.
*/
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { login } from 'src/app/interfaces/login';
import { mobile } from 'src/app/interfaces/mobile';
import { mobileLogin } from 'src/app/interfaces/mobileLogin';
import { UtilService } from 'src/app/services/util.service';
import { ApiService } from 'src/app/services/api.service';
import { AlertController, ModalController } from '@ionic/angular';
import { SelectCountryPage } from '../select-country/select-country.page';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import { VerifyPage } from '../verify/verify.page';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  viewPassword: boolean = false;

  login: login = {
    email: '',
    password: ''
  };

  loginWithPhonePassword: mobile = {
    country_code: '',
    mobile: '',
    password: ''
  }
  loginWithPhoneOTP: mobileLogin = {
    country_code: '',
    mobile: ''
  }
  submitted = false;
  isLogin: boolean = false;
  constructor(
    public util: UtilService,
    public api: ApiService,
    private modalCtrl: ModalController,
    private iab: InAppBrowser,
    private alertController: AlertController
  ) {
    setTimeout(() => {
      this.loginWithPhonePassword.country_code = '+' + this.util.default_country_code;
      this.loginWithPhoneOTP.country_code = '+' + this.util.default_country_code;
    }, 1000);
  }

  ngOnInit() {
  }


  changeType() {
    this.viewPassword = !this.viewPassword;
  }

  async openFirebaseAuthModal() {
    const options: InAppBrowserOptions = {
      location: 'no',
      clearcache: 'yes',
      zoom: 'yes',
      toolbar: 'yes',
      closebuttoncaption: 'close'
    };
    const param = {
      mobile: this.loginWithPhoneOTP.country_code + this.loginWithPhoneOTP.mobile
    }
    const browser = this.iab.create(this.api.baseUrl + 'v1/auth/firebaseauth?' + this.api.JSON_to_URLEncoded(param), '_blank', options);
    console.log('opended');
    console.log('browser=>');
    browser.on('loadstop').subscribe(event => {
      console.log('event?;>11', event);
      const navUrl = event.url;
      if (navUrl.includes('success_verified')) {
        const urlItems = new URL(event.url);
        console.log(urlItems);
        this.loginWithPhoneOTPVerified();
        browser.close();
      }
    });
    console.log('browser=> end');
  }

  loginWithPhoneAndOTP(form: NgForm) {
    console.log(form, form.valid);
    this.submitted = true;
    if (form.valid) {
      this.util.show();
      if (this.util.smsGateway == '2') { // Firebase OTP ON PHONE
        console.log('firebase');
        this.api.post_public('v1/auth/verifyPhoneForFirebaseDriver', this.loginWithPhoneOTP).then((data: any) => {
          console.log(data);
          this.util.hide();
          if (data && data.status && data.status == 200 && data.data) {
            console.log('open firebase web version');
            this.openFirebaseAuthModal();

          }
        }, error => {
          this.util.hide();
          this.util.apiErrorHandler(error);
        }).catch((error) => {
          this.util.hide();
          console.log(error);
          this.util.apiErrorHandler(error);
        });
      } else {
        this.api.post_public('v1/otp/verifyPhoneDriver', this.loginWithPhoneOTP).then((data: any) => {
          console.log(data);
          this.util.hide();
          if (data && data.status && data.status == 200 && data.data == true && data.otp_id) {
            this.openVerificationModal(data.otp_id, this.loginWithPhoneOTP.country_code + this.loginWithPhoneOTP.mobile);
          } else if (data && data.status && data.status == 500 && data.data == false) {
            this.util.errorToast(this.util.translate('Something went wrong'));
          }
        }, error => {
          this.util.hide();
          this.util.apiErrorHandler(error);
        }).catch((error) => {
          this.util.hide();
          console.log(error);
          this.util.apiErrorHandler(error);
        });
      }
    }
  }

  async openVerificationModal(id: any, to: any) {
    const modal = await this.modalCtrl.create({
      component: VerifyPage,
      backdropDismiss: false,
      cssClass: 'custom-modal',
      componentProps: {
        'id': id,
        'to': to
      }
    });
    modal.onDidDismiss().then((data) => {
      console.log(data.data, data.role);
      if (data && data.data && data.role && data.role == 'ok') {
        this.loginWithPhoneOTPVerified();
      }
    })
    return await modal.present();
  }

  loginWithPhoneOTPVerified() {
    console.log('login now .. it is verifieds');
    this.util.show();
    this.api.post_public('v1/auth/loginWithMobileOtpDriver', this.loginWithPhoneOTP).then((data: any) => {
      this.util.hide();
      console.log(data);
      if (data && data.status == 200) {
        if (data.user.status == 1) {
          localStorage.setItem('uid', data.user.id);
          localStorage.setItem('token', data.token);
          this.util.userInfo = data.user;
          this.updateFCMToken();
          this.getMyFavList();
          this.util.navigateRoot('tabs');
        } else {
          // blocked
          this.util.errorToast(this.util.translate('Your account is blocked, please contact administrator'));
        }

      } else if (data && data.status == 401 && data.error.error) {
        this.util.errorToast(data.error.error);
      } else {
        this.util.errorToast(this.util.translate('Something went wrong'));
      }
    }, error => {
      this.util.hide();
      this.util.apiErrorHandler(error);
    }).catch((error) => {
      this.util.hide();
      console.log(error);
      this.util.apiErrorHandler(error);
    });
  }

  resetPassword() {
    console.log('on reset');
    this.util.navigateToPage('reset-password');
  }

  goToTabs(form: NgForm) {
    console.log(form, form.valid);
    this.submitted = true;
    if (form.valid) {
      const emailfilter = /^[\w._-]+[+]?[\w._-]+@[\w.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailfilter.test(this.login.email)) {
        this.util.showToast(this.util.translate('Please enter valid email'), 'danger', 'bottom');
        return false;
      }
      this.isLogin = true;
      this.api.post_public('v1/auth/loginDrivers', this.login).then((data: any) => {
        this.isLogin = false;
        console.log('data=>', data);
        this.util.hide();
        if (data && data.status && data.status == 200 && data.user && data.user.id) {
          if (data.user.status == 1) {
            localStorage.setItem('uid', data.user.id);
            localStorage.setItem('token', data.token);
            this.util.userInfo = data.user;
            this.updateFCMToken();
            this.getMyFavList();
            this.util.navigateRoot('tabs');
          } else {
            // blocked
            this.util.errorToast(this.util.translate('Your account is blocked, please contact administrator'));
          }

        } else if (data && data.status == 401 && data.error.error) {
          this.util.showToast(data.error.error, 'dark', 'bottom');
        } else {
          this.util.showToast(this.util.translate('Something went wrong'), 'dark', 'bottom');
        }
      }, error => {
        this.isLogin = false;
        console.log('Error', error);
        this.util.apiErrorHandler(error);
      }).catch(error => {
        this.isLogin = false;
        console.log('Err', error);
        this.util.apiErrorHandler(error);
      });

    }
  }

  loginWithPhoneAndPassword(form: NgForm) {
    console.log(form, form.valid);
    this.submitted = true;
    if (form.valid) {
      this.isLogin = true;
      this.api.post_public('v1/auth/loginWithPhonePasswordDrivers', this.loginWithPhonePassword).then((data: any) => {
        this.isLogin = false;
        console.log('data=>', data);
        this.util.hide();
        if (data && data.status && data.status == 200 && data.user && data.user.id) {

          if (data.user.status == 1) {
            localStorage.setItem('uid', data.user.id);
            localStorage.setItem('token', data.token);
            this.util.userInfo = data.user;
            this.updateFCMToken();
            this.getMyFavList();
            this.util.navigateRoot('tabs');
          } else {
            // blocked
            this.util.errorToast(this.util.translate('Your account is blocked, please contact administrator'));
          }



        } else if (data && data.status == 401 && data.error.error) {
          this.util.showToast(data.error.error, 'dark', 'bottom');
        } else {
          this.util.showToast(this.util.translate('Something went wrong'), 'dark', 'bottom');
        }
      }, error => {
        this.isLogin = false;
        console.log('Error', error);
        this.util.apiErrorHandler(error);
      }).catch(error => {
        this.isLogin = false;
        console.log('Err', error);
        this.util.apiErrorHandler(error);
      });
    }
  }

  async openCountry() {
    if (this.util.countrys && this.util.countrys.length && this.util.countrys.length > 1) {
      console.log('open ccode');
      const modal = await this.modalCtrl.create({
        component: SelectCountryPage,
        backdropDismiss: false,
        showBackdrop: true,
      });
      modal.onDidDismiss().then((data) => {
        console.log(data);
        if (data && data.role == 'selected') {
          console.log('ok');
          this.loginWithPhoneOTP.country_code = '+' + data.data;
          this.loginWithPhonePassword.country_code = '+' + data.data;
        }
      });
      await modal.present();
    }

  }

  onRegister() {
    console.log('onRegister');
    this.util.navigateToPage('register');
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

  getMyFavList() {
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
}
