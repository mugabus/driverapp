/*
  Authors : initappz (Rahul Jograna)
  Website : https://initappz.com/
  App Name : Grocery Delivery App Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2023-present initappz.
*/
import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';
import * as moment from 'moment';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.page.html',
  styleUrls: ['./reviews.page.scss'],
})
export class ReviewsPage implements OnInit {
  dummy: any[] = [];
  reviews: any[] = [];
  constructor(
    public api: ApiService,
    public util: UtilService,
  ) {
    this.getReviews();
  }

  ngOnInit() {
  }

  getReviews() {
    const param = {
      id: localStorage.getItem('uid'),
    };
    this.dummy = Array(10);
    this.api.post_private('v1/ratings/getWithDriverId', param).then((data: any) => {
      this.dummy = [];
      console.log(data);
      if (data && data.status && data.status == 200 && data.data) {
        this.reviews = data.data;
      }
    }, error => {
      console.log(error);
      this.dummy = [];
      this.util.apiErrorHandler(error);
    }).catch(error => {
      console.log(error);
      this.dummy = [];
      this.util.apiErrorHandler(error);
    });
  }

  back() {
    this.util.onBack();
  }

  getDate(date: any) {
    return moment(date).format('lll');
  }

}
