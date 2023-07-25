/*
  Authors : initappz (Rahul Jograna)
  Website : https://initappz.com/
  App Name : Grocery Delivery App Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2023-present initappz.
*/
import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {
  constructor(
    public util: UtilService,
    public api: ApiService
  ) {

  }

  ngOnInit() {
  }

  editProfile() {
    this.util.navigateToPage('/edit-profile');
  }

  getReviews() {
    this.util.navigateToPage('/reviews');
  }

  getLanguages() {
    this.util.navigateToPage('/languages');
  }

  changePassword() {
    this.util.navigateToPage('/reset-password');
  }

  share() {

  }

  goToContact() {
    this.util.navigateToPage('tabs/tab2/contact');
  }
  openMenu() {
    this.util.openMenu();
  }

  getName() {
    return this.util.userInfo ? this.util.userInfo.first_name + ' ' + this.util.userInfo.last_name : 'Groceryee';
  }

  getEmail() {
    return this.util.userInfo ? this.util.userInfo.email : 'info@app.com';
  }

  getCover() {
    return this.util.userInfo ? this.api.mediaURL + this.util.userInfo.cover : '';
  }

  goToAbout() {
    const param: NavigationExtras = {
      queryParams: {
        id: 1,
        name: 'About Us'
      }
    }
    this.util.navigateToPage('/tabs/tab2/app-pages', param);
  }

  goFaqs() {
    const param: NavigationExtras = {
      queryParams: {
        id: 5,
        name: 'FAQs'
      }
    }
    this.util.navigateToPage('/tabs/tab2/app-pages', param);
  }

  goHelp() {
    const param: NavigationExtras = {
      queryParams: {
        id: 6,
        name: 'Help'
      }
    }
    this.util.navigateToPage('/tabs/tab2/app-pages', param);
  }
  logout() {
    this.util.show();
    this.api.post_private('v1/driver/logout', {}).then((data: any) => {
      this.util.hide();
      console.log(data);
      localStorage.removeItem('uid');
      localStorage.removeItem('token');
      this.util.navigateRoot('/login');
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
