/*
  Authors : initappz (Rahul Jograna)
  Website : https://initappz.com/
  App Name : Grocery Delivery App Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2023-present initappz.
*/
import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-verify',
  templateUrl: './verify.page.html',
  styleUrls: ['./verify.page.scss'],
})
export class VerifyPage implements OnInit {
  id: any;
  to: any;
  otp: any;
  submitted = false;
  isLogin: boolean = false;
  constructor(
    private navParam: NavParams,
    private modalCtrl: ModalController,
    public util: UtilService,
    public api: ApiService
  ) {
    this.id = this.navParam.get('id');
    this.to = this.navParam.get('to');
    console.log(this.id, this.to);
  }

  ngOnInit() {
  }
  onOtpChange(event: any) {
    console.log(event);
    this.otp = event;
  }

  onSubmit() {
    if (this.otp == '' || !this.otp) {
      this.util.errorToast(this.util.translate('Please enter OTP'));
      return false;
    }
    this.submitted = false;
    this.isLogin = true;
    const param = {
      id: this.id,
      otp: this.otp
    };
    this.api.post_public('v1/otp/verifyOTP', param).then((data: any) => {
      console.log(data);
      this.isLogin = false;
      if (data && data.status && data.status == 200 && data.data) {
        this.close(data, 'ok');
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

  close(data: any, role: any) {
    this.modalCtrl.dismiss(data, role);
  }

}
