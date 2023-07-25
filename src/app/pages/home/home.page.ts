/*
  Authors : initappz (Rahul Jograna)
  Website : https://initappz.com/
  App Name : Grocery Delivery App Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2023-present initappz.
*/
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';
import { NavigationExtras, Router } from '@angular/router';
import * as moment from 'moment';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  segId: any = 1;
  orders: any[] = [];
  oldOrders: any;
  olders: any[] = [];
  limit: any;
  dummy = Array(50);
  constructor(
    public api: ApiService,
    public util: UtilService,
    private router: Router,
    private chMod: ChangeDetectorRef
  ) {
    this.limit = 1;
    this.dummy = Array(50);
    this.getOrders('', false);
    this.util.subscribeOrder().subscribe((data) => {
      this.limit = 1;
      this.dummy = Array(50);
      this.getOrders('', false);
    });
  }

  ngOnInit() {
  }

  doRefresh(event: any) {
    console.log(event);
    this.limit = this.limit + 1;
    this.getOrders(event, true);
  }

  getOrders(event: any, haveRefresh: any) {
    const param = {
      id: localStorage.getItem('uid'),
      limit: this.limit * 10
    };

    this.api.post_private('v1/orders/getByDriverIdForApp', param).then((data: any) => {
      console.log(data);
      this.dummy = [];
      this.oldOrders = [];
      this.orders = [];
      if (data && data.status == 200 && data.data.length > 0) {
        data.data.forEach(async (element: any, index: any) => {
          if (((x) => { try { JSON.parse(x); return true; } catch (e) { return false } })(element.orders)) {
            element.orders = JSON.parse(element.orders);
            element.date_time = moment(element.date_time).format('dddd, MMMM Do YYYY');
            if (((x) => { try { JSON.parse(x); return true; } catch (e) { return false } })(element.status)) {
              const assinee = JSON.parse(element.assignee);
              const storeInfo = assinee.filter((x: any) => x.driver == localStorage.getItem('uid'));
              if (storeInfo && storeInfo.length) {
                const storeStatus = JSON.parse(element.status);

                const orderStatus = storeStatus.filter((x: any) => x.id == storeInfo[0].assignee);

                if (orderStatus && orderStatus.length) {
                  element.orders.forEach((order: any) => {

                    if (order.variations && order.variations != '' && typeof order.variations == 'string') {

                      order.variations = JSON.parse(order.variations);

                      if (order["variant"] == undefined) {
                        order['variant'] = 0;
                      }
                    }
                  });
                  const stat = orderStatus[0].status;

                  element['orderStatus'] = stat;
                  element.orders = await element.orders.filter((x: any) => x.store_id == storeInfo[0].assignee);
                  if (stat == 'delivered' || stat == 'cancelled' || stat == 'rejected' || stat == 'refund') {
                    this.oldOrders.push(element);
                  } else {
                    this.orders.push(element);
                  }
                }
              }
            }
          }

        });
        if (haveRefresh) {
          this.chMod.detectChanges();
          event.target.complete();
        }
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

  goToOrder(ids: any) {
    console.log(ids);
    const navData: NavigationExtras = {
      queryParams: {
        id: ids.id
      }
    };
    this.router.navigate(['/order-details'], navData);
  }
}
