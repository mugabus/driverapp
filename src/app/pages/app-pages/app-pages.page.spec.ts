/*
  Authors : initappz (Rahul Jograna)
  Website : https://initappz.com/
  App Name : Grocery Delivery App Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2023-present initappz.
*/
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppPagesPage } from './app-pages.page';

describe('AppPagesPage', () => {
  let component: AppPagesPage;
  let fixture: ComponentFixture<AppPagesPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AppPagesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
