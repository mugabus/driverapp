/*
  Authors : initappz (Rahul Jograna)
  Website : https://initappz.com/
  App Name : Grocery Delivery App Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2023-present initappz.
*/
import { Component, OnInit } from '@angular/core';
import { MenuController, NavController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-languages',
  templateUrl: './languages.page.html',
  styleUrls: ['./languages.page.scss'],
})
export class LanguagesPage implements OnInit {
  dummy: any[] = [];
  list: any[] = [];
  selected: any;
  constructor(
    public api: ApiService,
    public util: UtilService,
    private navCtrl: NavController,
  ) {
    console.log(localStorage.getItem('translateKey'));
    this.selected = parseInt(localStorage.getItem('translateKey') ?? '');
    this.getLaguguages();
  }

  ngOnInit() {
  }

  getLaguguages() {
    this.list = [];
    this.dummy = Array(5);
    this.api.get_public('v1/languages/getLanguages').then((data: any) => {
      console.log(data);
      this.dummy = [];
      if (data && data.status && data.status == 200 && data.data && data.data.length) {
        this.list = data.data;
      }
      console.log(this.list);
    }, error => {
      console.log(error);
      this.dummy = [];
      this.util.apiErrorHandler(error);
    }).catch(error => {
      console.log(error);
      this.dummy = [];
      this.util.apiErrorHandler(error);
    })
  }

  goToBack() {
    this.navCtrl.back();
  }

  changed() {
    console.log(this.selected);
    const item = this.list.filter(x => x.id == this.selected);
    if (item && item.length > 0) {
      console.log(item);
      localStorage.setItem('translateKey', this.selected);
      window.location.reload();
    }
  }

}
