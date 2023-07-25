/*
  Authors : initappz (Rahul Jograna)
  Website : https://initappz.com/
  App Name : Grocery Delivery App Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2023-present initappz.
*/
import { TestBed, async, inject } from '@angular/core/testing';

import { IntroGuard } from './auth.guard';

describe('IntroGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IntroGuard]
    });
  });

  it('should ...', inject([IntroGuard], (guard: IntroGuard) => {
    expect(guard).toBeTruthy();
  }));
});
