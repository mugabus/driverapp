/*
  Authors : initappz (Rahul Jograna)
  Website : https://initappz.com/
  App Name : Grocery Delivery App Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2023-present initappz.
*/
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';
import { register } from 'swiper/element/bundle';
import Swiper from 'swiper';

register();
@Component({
  selector: 'app-intro',
  templateUrl: './intro.page.html',
  styleUrls: ['./intro.page.scss'],
})
export class IntroPage implements OnInit {
  @ViewChild("swiper") swiper?: ElementRef<{ swiper: Swiper }>
  isLast: boolean = false;
  length: any = 0;
  index: any = 0;

  items: any[] = [];

  languages: any[] = [];
  langId: any = '';
  constructor(
    public util: UtilService,
    public api: ApiService
  ) {
    const lang = localStorage.getItem('translateKey');
    console.log('lang', lang);
    if (lang && lang != '' && lang != null && lang != 'null') {
      this.langId = parseInt(lang);
    }
    this.getLanguages();
    setTimeout(() => {
      this.length = this.swiper?.nativeElement.swiper.slides.length;
      console.log(this.length);
      this.items = [];
      for (let i = 0; i < this.length; i++) {
        this.items.push(i);
      }
    }, 1000);
  }

  changeLanguage() {
    console.log(this.langId);
    localStorage.setItem('translateKey', this.langId);
    window.location.reload();
  }

  getLanguages() {
    this.api.get_public('v1/languages/getLanguages').then((data: any) => {
      console.log(data);
      if (data && data.status && data.status == 200 && data.data && data.data.length) {
        this.languages = data.data;
      }
    }, error => {
      console.log(error);
      this.util.apiErrorHandler(error);
    }).catch(error => {
      console.log(error);
      this.util.apiErrorHandler(error);
    });
  }
  ngOnInit() {
  }

  onLogin() {
    localStorage.setItem('intro', 'true');
    this.util.navigateRoot('tabs');
  }

  slideChanged(event: any) {
    this.index = this.swiper?.nativeElement.swiper.activeIndex;
    this.isLast = this.swiper?.nativeElement.swiper.isEnd ?? false;
  }

  getContent(num: any) {
    if (num == 1) {
      return this.util.translate('Fresh fruits and vegetables are an important part of a healthy diet. They contain essential vitamins, minerals, fiber and other nutrients that are essential for good health');
    }
    if (num == 2) {
      return this.util.translate("We're slowly becoming more aware of how our individual choices can impact our planet. And food - how we consume it and how we shop for it - is one of the most important ways we can make a difference.");
    }
    if (num == 3) {
      return this.util.translate('Best quality product with organic maintenance but with affordable price.');
    }
    if (num == 4) {
      return this.util.translate('Free delivery service for highest cart value, without minimum payment.');
    }
  }
}
