/*
  Authors : initappz (Rahul Jograna)
  Website : https://initappz.com/
  App Name : Grocery Delivery App Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2023-present initappz.
*/
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerifyResetPage } from './verify-reset.page';

describe('VerifyResetPage', () => {
  let component: VerifyResetPage;
  let fixture: ComponentFixture<VerifyResetPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(VerifyResetPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
