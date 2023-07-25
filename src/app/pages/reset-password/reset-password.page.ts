/*
  Authors : initappz (Rahul Jograna)
  Website : https://initappz.com/
  App Name : Grocery Delivery App Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2023-present initappz.
*/
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { forgot } from 'src/app/interfaces/forgot';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';
import { mobileLogin } from 'src/app/interfaces/mobileLogin';
import { AlertController, ModalController } from '@ionic/angular';
import { SelectCountryPage } from '../select-country/select-country.page';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import { password } from 'src/app/interfaces/password';
import { VerifyResetPage } from '../verify-reset/verify-reset.page';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
})
export class ResetPasswordPage implements OnInit {
  submitted = false;
  isLogin: boolean = false;
  login: forgot = {
    email: '',
  };

  loginWithPhoneOTP: mobileLogin = {
    country_code: '',
    mobile: ''
  }

  newPassword: password = {
    password: '',
    confirm: ''
  }
  step: any = 1;

  temp: any = '';

  otpId: any = '';
  constructor(
    public util: UtilService,
    public api: ApiService,
    private modalCtrl: ModalController,
    private iab: InAppBrowser,
    private alertController: AlertController
  ) {
    setTimeout(() => {
      this.loginWithPhoneOTP.country_code = '+' + this.util.default_country_code;
    }, 1000);
  }


  ngOnInit() {
  }

  sendOTPonEmail(form: NgForm) {
    console.log(form, form.valid);
    this.submitted = true;
    if (form.valid) {
      const emailfilter = /^[\w._-]+[+]?[\w._-]+@[\w.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailfilter.test(this.login.email)) {
        this.util.showToast(this.util.translate('Please enter valid email'), 'danger', 'bottom');
        return false;
      }
      this.util.show();
      this.api.post_public('v1/auth/verifyEmailForResetDriver', this.login).then((data: any) => {
        console.log(data);
        this.util.hide();
        if (data && data.status && data.status == 200 && data.data == true && data.otp_id) {
          // send otp from api
          this.openVerificationModal(data.otp_id, this.login.email, this.login);
        } else if (data && data.status && data.status == 500 && data.data == false) {
          this.util.errorToast(data.message);
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

  sendOTPonPhone(form: NgForm) {
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
            this.openVerificationModal(data.otp_id, this.loginWithPhoneOTP.country_code + this.loginWithPhoneOTP.mobile, this.loginWithPhoneOTP);
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

  async openVerificationModal(id: any, to: any, obj: any) {
    this.otpId = id;
    const modal = await this.modalCtrl.create({
      component: VerifyResetPage,
      backdropDismiss: false,
      cssClass: 'custom-modal',
      componentProps: {
        'id': id,
        'to': to,
        'obj': obj
      }
    });
    modal.onDidDismiss().then((data) => {
      console.log(data.data, data.role);
      if (data && data.data && data.role && data.role == 'ok') {
        this.submitted = false;
        this.temp = data.data.temp;
        console.log('temp token', this.temp);
        this.step = 2;
      }
    })
    return await modal.present();
  }

  generateTokenFromCreds() {
    this.util.show();
    this.api.post_public('v1/otp/generateTempTokenDriver', this.loginWithPhoneOTP).then((data: any) => {
      console.log(data);
      this.util.hide();
      if (data && data.status && data.status == 200) {
        this.step = 2;
        this.temp = data.temp;
        console.log('temp token', this.temp);
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
        this.submitted = false;
        this.generateTokenFromCreds();
        browser.close();
      }
    });
    console.log('browser=> end');
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
        }
      });
      await modal.present();
    }

  }

  updatePasswordWithEmail() {
    this.submitted = false;
    this.isLogin = true;
    const param = {
      id: this.otpId,
      email: this.login.email,
      password: this.newPassword.password
    };
    this.api.post_temp('v1/password/updateUserPasswordWithEmailDriver', param, this.temp).then((data: any) => {
      console.log(data);
      this.isLogin = false;
      if (data && data.status && data.status == 200 && data.data) {
        this.util.showToast(this.util.translate('Password Updated'), 'success', 'bottom');
        this.util.onBack();
      }
    }, error => {
      this.isLogin = false;
      console.log(error);
      if (error && error.status == 401 && error.error.error) {
        this.util.errorToast(error.error.error);
        return false;
      }
      if (error && error.status == 500 && error.error.error) {
        this.util.errorToast(error.error.error);
        return false;
      }
      this.isLogin = false;
      this.util.errorToast(this.util.translate('Wrong OTP'));
    }).catch((error) => {
      this.isLogin = false;
      console.log(error);
      if (error && error.status == 401 && error.error.error) {
        this.util.errorToast(error.error.error);
        return false;
      }
      if (error && error.status == 500 && error.error.error) {
        this.util.errorToast(error.error.error);
        return false;
      }
      this.isLogin = false;
      this.util.errorToast(this.util.translate('Wrong OTP'));
    });
  }

  updatePasswordWithPhone() {
    this.submitted = false;
    this.isLogin = true;
    const param = {
      id: this.otpId,
      country_code: this.loginWithPhoneOTP.country_code,
      mobile: this.loginWithPhoneOTP.mobile,
      password: this.newPassword.password,
      key: this.loginWithPhoneOTP.country_code + this.loginWithPhoneOTP.mobile
    };
    this.api.post_temp('v1/password/updateUserPasswordWithPhoneDriver', param, this.temp).then((data: any) => {
      console.log(data);
      this.isLogin = false;
      if (data && data.status && data.status == 200 && data.data) {
        this.util.showToast(this.util.translate('Password Updated'), 'success', 'bottom');
        this.util.onBack();
      }
    }, error => {
      this.isLogin = false;
      console.log(error);
      if (error && error.status == 401 && error.error.error) {
        this.util.errorToast(error.error.error);
        return false;
      }
      if (error && error.status == 500 && error.error.error) {
        this.util.errorToast(error.error.error);
        return false;
      }
      this.isLogin = false;
      this.util.errorToast(this.util.translate('Wrong OTP'));
    }).catch((error) => {
      this.isLogin = false;
      console.log(error);
      if (error && error.status == 401 && error.error.error) {
        this.util.errorToast(error.error.error);
        return false;
      }
      if (error && error.status == 500 && error.error.error) {
        this.util.errorToast(error.error.error);
        return false;
      }
      this.isLogin = false;
      this.util.errorToast(this.util.translate('Wrong OTP'));
    });
  }

  updatePasswordFromFirebase() {
    this.submitted = false;
    this.isLogin = true;
    const param = {
      country_code: this.loginWithPhoneOTP.country_code,
      mobile: this.loginWithPhoneOTP.mobile,
      password: this.newPassword.password,
    };
    this.api.post_temp('v1/password/updatePasswordFromFirebaseDriver', param, this.temp).then((data: any) => {
      console.log(data);
      this.isLogin = false;
      if (data && data.status && data.status == 200 && data.data) {
        this.util.showToast(this.util.translate('Password Updated'), 'success', 'bottom');
        this.util.onBack();
      }
    }, error => {
      this.isLogin = false;
      console.log(error);
      if (error && error.status == 401 && error.error.error) {
        this.util.errorToast(error.error.error);
        return false;
      }
      if (error && error.status == 500 && error.error.error) {
        this.util.errorToast(error.error.error);
        return false;
      }
      this.isLogin = false;
      this.util.errorToast(this.util.translate('Wrong OTP'));
    }).catch((error) => {
      this.isLogin = false;
      console.log(error);
      if (error && error.status == 401 && error.error.error) {
        this.util.errorToast(error.error.error);
        return false;
      }
      if (error && error.status == 500 && error.error.error) {
        this.util.errorToast(error.error.error);
        return false;
      }
      this.isLogin = false;
      this.util.errorToast(this.util.translate('Wrong OTP'));
    });
  }
  validateOtp(form: NgForm) {
    console.log(form, form.valid);
    this.submitted = true;
    if (form.valid) {
      if (this.newPassword.password != this.newPassword.confirm) {
        this.util.errorToast(this.util.translate('Password does not match'));
        return false;
      }
      if (this.util.reset_pwd == 0) {
        this.updatePasswordWithEmail();
      } else if (this.util.smsGateway == '2' && this.util.reset_pwd == 1) {
        this.updatePasswordFromFirebase();
      } else if (this.util.reset_pwd == 1 && this.util.smsGateway != '2') {
        this.updatePasswordWithPhone();
      }

    }
  }
}
