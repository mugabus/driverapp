/*
  Authors : initappz (Rahul Jograna)
  Website : https://initappz.com/
  App Name : Grocery Delivery App Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2023-present initappz.
*/
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { AlertController, ModalController, NavController } from '@ionic/angular';
import { UtilService } from 'src/app/services/util.service';
import { ApiService } from 'src/app/services/api.service';
import * as moment from 'moment';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import { VerifyPage } from '../verify/verify.page';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.page.html',
  styleUrls: ['./order-details.page.scss'],
})
export class OrderDetailsPage implements OnInit {
  id: any;
  loaded: boolean;
  orderDetail: any[] = [];
  orders: any[] = [];
  payMethod: any;
  status: any;
  datetime: any;
  orderAt: any;
  address: any;
  userInfo: any;
  storeInfo: any;
  storeDataInfo: any;
  storeId: any;
  changeStatusOrder: any;
  userLat: any;
  userLng: any;

  statusText: any;
  orderStatus: any[] = [];
  grandTotal: any;

  haveDeliveryCharge: boolean = false;
  deliveryCharge: any = 0;
  orderTax: any = 0;

  totalStores: any = 0;
  orderTotal: any = 0;
  orderDiscount: any = 0;
  orderDeliveryCharge: any = 0;
  orderWalletDiscount: any = 0;
  orderTaxCharge: any = 0;
  orderGrandTotal: any = 0;
  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    public util: UtilService,
    public api: ApiService,
    private iab: InAppBrowser,
    private modalCtrl: ModalController,
    private router: Router,
    private alertController: AlertController
  ) {
    this.route.queryParams.subscribe((data: any) => {
      console.log(data);
      if (data && data.id) {
        this.id = data.id;
        this.loaded = false;
        this.getOrder();
        console.log('userdinfo', this.util.userInfo);
        if (this.util.userInfo && this.util.userInfo.first_name) {
          this.statusText = ' by driver ' + this.util.userInfo.first_name + ' ' + this.util.userInfo.last_name;
        }
      } else {
        this.navCtrl.back();
      }
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
      mobile: this.userInfo.country_code + this.userInfo.mobile
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
        this.updateOrderFromSMS();
        browser.close();
      }
    });
    console.log('browser=> end');
  }

  updateOrderFromSMS() {
    console.log('normal delivery');
    this.orderStatus.forEach(element => {
      if (element.id == this.storeId) {
        element.status = this.changeStatusOrder;
      }
    });
    if (this.changeStatusOrder != 'ongoing' && this.orderAt == 'home') {
      // release driver from this order
      console.log('relase driver');

      const newOrderNotes = {
        status: 1,
        value: 'Order ' + this.changeStatusOrder + this.statusText,
        time: moment().format('lll'),
      };
      this.orderDetail.push(newOrderNotes);

      this.util.show();
      const param = {
        id: this.id,
        notes: JSON.stringify(this.orderDetail),
        status: JSON.stringify(this.orderStatus),
        order_status: this.changeStatusOrder
      };
      this.api.post_private('v1/orders/updateStatusDriver', param).then((data: any) => {
        console.log('order', data);
        this.util.hide();
        this.updateDriver(localStorage.getItem('uid'), 'active');
        if (data && data.status == 200) {
          this.sendNotification(this.changeStatusOrder);
          this.back();
        } else {
          this.util.apiErrorHandler(data);
        }
      }, error => {
        console.log(error);
        this.util.hide();
        this.util.apiErrorHandler(error);
      });
    } else {
      const newOrderNotes = {
        status: 1,
        value: 'Order ' + this.changeStatusOrder + this.statusText,
        time: moment().format('lll'),
      };
      this.orderDetail.push(newOrderNotes);

      this.util.show();
      const param = {
        id: this.id,
        notes: JSON.stringify(this.orderDetail),
        status: JSON.stringify(this.orderStatus),
        order_status: this.changeStatusOrder
      };
      this.api.post_private('v1/orders/updateStatusDriver', param).then((data: any) => {
        console.log('order', data);
        this.util.hide();
        if (data && data.status == 200) {
          this.sendNotification(this.changeStatusOrder);
          this.back();
        } else {
          this.util.apiErrorHandler(data);
        }
      }, error => {
        console.log(error);
        this.util.hide();
        this.util.apiErrorHandler(error);
      });
    }
  }
  degreesToRadians(degrees: any) {
    return degrees * Math.PI / 180;
  }

  distanceInKmBetweenEarthCoordinates(lat1: any, lon1: any, lat2: any, lon2: any) {
    console.log(lat1, lon1, lat2, lon2);
    const earthRadiusKm = 6371;
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLon = this.degreesToRadians(lon2 - lon1);
    lat1 = this.degreesToRadians(lat1);
    lat2 = this.degreesToRadians(lat2);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
  }

  getOrder() {
    const param = {
      id: this.id
    };
    this.api.post_private('v1/orders/getByIdFromDriver', param).then((data: any) => {
      console.log(data);
      this.loaded = true;
      if (data && data.status && data.status == 200 && data.data) {
        const info = data.data;
        console.log(info);
        this.orderDetail = JSON.parse(info.notes);
        const order = JSON.parse(info.orders);
        const ids = [...new Set(order.map((item: any) => item.store_id))];
        this.totalStores = ids.length;
        const assinee = JSON.parse(info.assignee);
        console.log('assinee', assinee);
        const storeInfo = assinee.filter((x: any) => x.driver == localStorage.getItem('uid'));
        console.log('storeinfo==>>', storeInfo);
        if (info.delivery_charge != '0.00') {
          console.log('have delivery charge-----<><<<<<', info.delivery_charge);
          console.log('general', this.util.general);
          this.haveDeliveryCharge = true;
        } else {
          console.log('no deliery charge--,');
        }
        if (storeInfo && storeInfo.length) {
          this.storeId = storeInfo[0].assignee;
          this.orders = order.filter((x: any) => x.store_id == this.storeId);
          let total = 0;
          this.orders.forEach((element) => {
            let price = 0;
            if (element.variations && element.variations != '' && typeof element.variations == 'string') {
              console.log('strings', element.id);
              element.variations = JSON.parse(element.variations);
              console.log(element['variant']);
              if (element["variant"] == undefined) {
                element['variant'] = 0;
              }
            }
            if (element && element.discount == 0) {
              if (element.size == 1 || element.size == 1) {
                if (element.variations[0].items[element.variant].discount && element.variations[0].items[element.variant].discount != 0) {
                  price = price + (parseFloat(element.variations[0].items[element.variant].discount) * element.quantiy);
                } else {
                  price = price + (parseFloat(element.variations[0].items[element.variant].price) * element.quantiy);
                }
              } else {
                price = price + (parseFloat(element.original_price) * element.quantiy);
              }
            } else {
              if (element.size == 1 || element.size == 1) {
                if (element.variations[0].items[element.variant].discount && element.variations[0].items[element.variant].discount != 0) {
                  price = price + (parseFloat(element.variations[0].items[element.variant].discount) * element.quantiy);
                } else {
                  price = price + (parseFloat(element.variations[0].items[element.variant].price) * element.quantiy);
                }
              } else {
                price = price + (parseFloat(element.sell_price) * element.quantiy);
              }
            }
            console.log('PRICEEE-->', price);
            console.log(total, price);
            total = total + price;
          });
          console.log('==>', total);
          this.orderTotal = total.toFixed(2);
          this.grandTotal = total.toFixed(2);
          const storeStatus = JSON.parse(info.status);
          this.orderStatus = storeStatus;
          const orderStatus = storeStatus.filter((x: any) => x.id == storeInfo[0].assignee);
          this.status = orderStatus[0].status;
          if (info.discount > 0) {
            this.orderDiscount = (info.discount / this.totalStores).toFixed(2);
          }
          if (info.wallet_used == 1) {
            this.orderWalletDiscount = (info.wallet_price / this.totalStores).toFixed(2);
          }
          console.log('status-------------------->', this.status);
          if (((x) => { try { JSON.parse(x); return true; } catch (e) { return false } })(info.extra)) {
            const extras = JSON.parse(info.extra);
            console.log('extra==>>', extras);
            if (extras && extras.length) {
              const storeExtra = extras.filter((x: any) => x.store_id == this.storeId);
              console.log('--< storeExtra->', storeExtra);
              if (extras && storeExtra.length && info.order_to == 'home') {
                if (storeExtra[0].shipping == 'km') {
                  const deliveryCharge = parseFloat(storeExtra[0].distance) * parseFloat(storeExtra[0].shippingPrice);
                  console.log('delivert charge of ', deliveryCharge);
                  this.orderDeliveryCharge = deliveryCharge.toFixed(2);
                  this.orderTaxCharge = parseFloat(storeExtra[0].tax).toFixed(2);
                } else {
                  this.orderDeliveryCharge = (parseFloat(storeExtra[0].shippingPrice) / this.totalStores).toFixed(2);
                  this.orderTaxCharge = parseFloat(storeExtra[0].tax).toFixed(2);
                }
              } else {
                this.orderTaxCharge = parseFloat(storeExtra[0].tax);
              }
            }
          }
          this.getStoreInfo();
        }
        // this.storeId = info.assignee;
        console.log('order===>>', this.orders);
        // this.status = info.status;
        this.datetime = moment(info.date_time).format('dddd, MMMM Do YYYY');
        this.payMethod = info.paid_method == 'cod' ? 'COD' : 'PAID';
        this.orderAt = info.order_to;
        this.userInfo = data.user;
        if (this.orderAt == 'home') {
          const address = JSON.parse(info.address);
          console.log('---address', address);
          if (address && address.address) {
            this.userLat = address.lat;
            this.userLng = address.lng;
            this.address = address.landmark + ' ' + address.house + ' ' + address.address + ' ' + address.pincode;
          }
        }
      } else {
        this.util.apiErrorHandler(data);
      }
    }, error => {
      console.log(error);
      this.loaded = true;
      this.util.apiErrorHandler(error);
    }).catch(error => {
      console.log(error);
      this.loaded = true;
      this.util.apiErrorHandler(error);
    });
  }

  getTotalBilling() {
    const total = parseFloat(this.orderTotal) + parseFloat(this.orderTaxCharge) + parseFloat(this.orderDeliveryCharge);
    const discount = parseFloat(this.orderDiscount) + parseFloat(this.orderWalletDiscount);
    return total - discount > 0 ? total - discount : 0;
  }

  direction(type: any) {
    console.log(type);
    if (type == 'store') {
      const navData: NavigationExtras = {
        queryParams: {
          lat: this.storeDataInfo.lat,
          lng: this.storeDataInfo.lng,
          who: type,
          id: this.storeDataInfo.uid,
          orderId: this.id,
          grandTotal: this.getTotalBilling(),
          payMethod: this.payMethod,
          address: ''
        }
      };
      this.router.navigate(['direction'], navData);
    } else {
      const navData: NavigationExtras = {
        queryParams: {
          lat: this.userLat,
          lng: this.userLng,
          who: type,
          id: this.userInfo.id,
          orderId: this.id,
          grandTotal: this.getTotalBilling(),
          payMethod: this.payMethod,
          address: this.address
        }
      };
      this.router.navigate(['direction'], navData);
    }


  }

  getStoreInfo() {
    const param = {
      id: this.storeId
    };
    this.api.post_private('v1/stores/getStoreInfoFromDriver', param).then(async (data: any) => {
      console.log(data);
      if (data && data.status && data.status == 200 && data.data) {
        this.storeDataInfo = data.data;
        console.log('store info===>>', this.storeDataInfo);

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

  back() {
    this.util.publishNewOrder();
    this.navCtrl.back();
  }

  call() {
    if (this.userInfo.mobile) {
      window.open('tel:' + this.userInfo.mobile, '_system');
    } else {
      this.util.errorToast(this.util.translate('Number not found'));
    }
  }

  email() {
    if (this.userInfo.email) {
      window.open('mailto:' + this.userInfo.email, '_system');
    } else {
      this.util.errorToast(this.util.translate('Email not found'));
    }
  }

  printOrder() {
    console.log('print order');
  }

  updateDriver(uid: any, value: any) {
    const param = {
      id: uid,
      current: value
    };
    console.log('param', param);
    this.api.post_private('v1/drivers/edit_myProfile', param).then((data: any) => {
      console.log(data);
    }, error => {
      console.log(error);
    });
  }

  sendNotification(value: any) {
    const param = {
      title: 'Order ' + value,
      message: 'Your order #' + this.id + ' ' + value,
      id: this.userInfo.fcm_token
    };
    this.api.post_private('v1/noti/sendNotification', param).then((data: any) => {
      console.log(data);
    }, error => {
      console.log(error);
    }).catch(error => {
      console.log(error);
    });
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
        this.updateOrderFromSMS();
      }
    })
    return await modal.present();
  }

  changeOrderStatus() {
    console.log(this.changeStatusOrder);
    console.log(this.orderDetail);
    if (this.changeStatusOrder) {
      if (this.changeStatusOrder == 'delivered' && this.util.delivery == 1) {
        console.log('do delivery', this.userInfo.mobile);
        if (this.util.smsGateway == '2') { // Firebase OTP ON PHONE
          this.openFirebaseAuthModal();
        } else {
          this.util.show();
          this.api.post_public('v1/otp/verifyPhone', this.userInfo).then((data: any) => {
            console.log(data);
            this.util.hide();
            if (data && data.status && data.status == 200 && data.data == true && data.otp_id) {
              this.openVerificationModal(data.otp_id, this.userInfo.country_code + this.userInfo.mobile);
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
        // this.openModal();
      } else {
        console.log('normal delivery');
        this.orderStatus.forEach(element => {
          if (element.id == this.storeId) {
            element.status = this.changeStatusOrder;
          }
        });
        if (this.changeStatusOrder != 'ongoing' && this.orderAt == 'home') {
          // release driver from this order
          console.log('relase driver');

          const newOrderNotes = {
            status: 1,
            value: 'Order ' + this.changeStatusOrder + this.statusText,
            time: moment().format('lll'),
          };
          this.orderDetail.push(newOrderNotes);

          this.util.show();
          const param = {
            id: this.id,
            notes: JSON.stringify(this.orderDetail),
            status: JSON.stringify(this.orderStatus),
            order_status: this.changeStatusOrder
          };
          this.api.post_private('v1/orders/updateStatusDriver', param).then((data: any) => {
            console.log('order', data);
            this.util.hide();
            this.updateDriver(localStorage.getItem('uid'), 'active');
            if (data && data.status == 200) {
              this.sendNotification(this.changeStatusOrder);
              this.back();
            } else {
              this.util.apiErrorHandler(data);
            }
          }, error => {
            console.log(error);
            this.util.hide();
            this.util.apiErrorHandler(error);
          });
        } else {
          const newOrderNotes = {
            status: 1,
            value: 'Order ' + this.changeStatusOrder + this.statusText,
            time: moment().format('lll'),
          };
          this.orderDetail.push(newOrderNotes);

          this.util.show();
          const param = {
            id: this.id,
            notes: JSON.stringify(this.orderDetail),
            status: JSON.stringify(this.orderStatus),
            order_status: this.changeStatusOrder
          };
          this.api.post_private('v1/orders/updateStatusDriver', param).then((data: any) => {
            console.log('order', data);
            this.util.hide();
            if (data && data.status == 200) {
              this.sendNotification(this.changeStatusOrder);
              this.back();
            } else {
              this.util.apiErrorHandler(data);
            }
          }, error => {
            console.log(error);
            this.util.hide();
            this.util.apiErrorHandler(error);
          });
        }
      }
    }
  }

  contact() {
    console.log(this.storeDataInfo);
    window.open('tel:' + this.storeDataInfo.mobile, '_system');
  }
}
