/*
  Authors : initappz (Rahul Jograna)
  Website : https://initappz.com/
  App Name : Grocery Delivery App Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2023-present initappz.
*/
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
declare var google: any;

@Component({
  selector: 'app-direction',
  templateUrl: './direction.page.html',
  styleUrls: ['./direction.page.scss'],
})
export class DirectionPage implements OnInit {
  @ViewChild('map', { static: true }) mapElement: ElementRef;
  map: any;

  oppLat: any;
  oppLng: any;

  storeInfo: any;
  userInfo: any;

  who: any;
  uid: any;
  interval: any;

  orderId: any;

  grandTotal: any;
  payMethod: any;

  userAddress: any;
  watchId: any;
  constructor(
    public api: ApiService,
    public util: UtilService,
    private route: ActivatedRoute,
    public navCtrl: NavController,
    private iab: InAppBrowser,

  ) {
    this.route.queryParams.subscribe((data: any) => {
      console.log(data);
      if (data && data.id && data.lat && data.lng && data.who) {
        this.uid = data.id;
        this.orderId = data.orderId;
        this.who = data.who;
        this.grandTotal = data.grandTotal;
        this.payMethod = data.payMethod;
        this.oppLng = parseFloat(data.lat);
        this.oppLng = parseFloat(data.lng);
        if (this.who == 'store') {
          this.oppLat = parseFloat(data.lat);
          this.oppLng = parseFloat(data.lng);
          this.loadMap(this.util.myLat, this.util.myLng, this.oppLat, this.oppLng);
          const param = {
            id: this.uid
          };
          this.api.post_private('v1/stores/getStoreInfoFromDriver', param).then((data: any) => {
            console.log('*******************', data);
            if (data && data.status && data.status == 200 && data.data) {
              this.oppLng = parseFloat(data.data.lat);
              this.oppLng = parseFloat(data.data.lng);
              this.storeInfo = data.data;
            }
          }, error => {
            console.log(error);
          });
        } else {
          this.oppLat = parseFloat(data.lat);
          this.oppLng = parseFloat(data.lng);
          this.loadMap(this.util.myLat, this.util.myLng, this.oppLat, this.oppLng);
          this.userAddress = data.address;
          const param = {
            id: this.uid
          };
          this.api.post_private('v1/profile/userByIdFromDriver', param).then((data: any) => {
            console.log('user info=>', data);
            if (data && data.status && data.status == 200 && data.data) {
              this.userInfo = data.data;
            }
          }, error => {
            console.log(error);
          });
        }
      } else {
        this.navCtrl.back();
      }
    });
  }

  callUser() {
    this.iab.create('tel:' + this.userInfo.mobile, '_system');
  }

  callStore() {
    this.iab.create('tel:' + this.storeInfo.mobile, '_system');
  }

  loadMap(latOri: any, lngOri: any, latDest: any, lngDest: any) {
    const directionsService = new google.maps.DirectionsService;
    let directionsDisplay = new google.maps.DirectionsRenderer;
    directionsDisplay = new google.maps.DirectionsRenderer();
    const bounds = new google.maps.LatLngBounds;

    const origin1 = { lat: parseFloat(latOri), lng: parseFloat(lngOri) };
    const destinationA = { lat: latDest, lng: lngDest };

    const maps = new google.maps.Map(this.mapElement.nativeElement, {
      center: { lat: latOri, lng: lngOri },
      disableDefaultUI: true,
      zoom: 100
    });

    const custPos = new google.maps.LatLng(latOri, lngOri);
    const restPos = new google.maps.LatLng(latDest, lngDest);

    const logo = {
      url: 'assets/marker.png',
      scaledSize: new google.maps.Size(50, 50), // scaled size
      origin: new google.maps.Point(0, 0), // origin
      anchor: new google.maps.Point(0, 0) // anchor
    };
    const marker = new google.maps.Marker({
      map: maps,
      position: custPos,
      animation: google.maps.Animation.DROP,
      icon: logo,
    });
    const markerCust = new google.maps.Marker({
      map: maps,
      position: restPos,
      animation: google.maps.Animation.DROP,
    });
    marker.setMap(maps);
    markerCust.setMap(maps);

    directionsDisplay.setMap(maps);
    // directionsDisplay.setOptions({ suppressMarkers: true });
    directionsDisplay.setOptions({
      polylineOptions: {
        strokeWeight: 4,
        strokeOpacity: 1,
        strokeColor: '#44C261'
      },
      suppressMarkers: true
    });
    const geocoder = new google.maps.Geocoder;

    const service = new google.maps.DistanceMatrixService;

    service.getDistanceMatrix({
      origins: [origin1],
      destinations: [destinationA],
      travelMode: 'DRIVING',
      unitSystem: google.maps.UnitSystem.METRIC,
      avoidHighways: false,
      avoidTolls: false
    }, function (response: any, status: any) {
      if (status != 'OK') {
        alert('Error was: ' + status);
      } else {
        const originList = response.originAddresses;
        const destinationList = response.destinationAddresses;
        const showGeocodedAddressOnMap = function (asDestination: any) {
          return function (results: any, status: any) {
            if (status == 'OK') {
              maps.fitBounds(bounds.extend(results[0].geometry.location));
            } else {
              alert('Geocode was not successful due to: ' + status);
            }
          };
        };

        directionsService.route({
          origin: origin1,
          destination: destinationA,
          travelMode: 'DRIVING'
        }, function (response: any, status: any) {
          if (status == 'OK') {
            directionsDisplay.setDirections(response);
          } else {
            window.alert('Directions request failed due to ' + status);
          }
        });


        for (let i = 0; i < originList.length; i++) {
          const results = response.rows[i].elements;
          geocoder.geocode({ 'address': originList[i] },
            showGeocodedAddressOnMap(false));
          for (let j = 0; j < results.length; j++) {
            geocoder.geocode({ 'address': destinationList[j] },
              showGeocodedAddressOnMap(true));
          }
        }
      }
    });
    this.interval = setInterval(() => {
      this.changeMyMarker(marker, maps);
    }, 12000);
  }

  ionViewDidLeave() {
    console.log('leaved');
    clearInterval(this.interval);
  }

  changeMyMarker(marker: any, map: any) {
    const latlng = new google.maps.LatLng(this.util.myLat, this.util.myLat);
    map.setCenter(latlng);
    marker.setPosition(latlng);
  }

  ngOnInit() {
  }
}
