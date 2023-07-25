/*
  Authors : initappz (Rahul Jograna)
  Website : https://initappz.com/
  App Name : Grocery Delivery App Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2023-present initappz.
*/
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'tab1',
        loadChildren: () => import('../home/home.module').then(m => m.HomePageModule)
      },
      {
        path: 'tab2',
        children: [
          {
            path: '',
            loadChildren: () => import('../account/account.module').then(m => m.AccountPageModule)
          },
          {
            path: 'contact',
            loadChildren: () => import('../contacts/contacts.module').then(m => m.ContactsPageModule)
          },
          {
            path: 'app-pages',
            loadChildren: () => import('../app-pages/app-pages.module').then(m => m.AppPagesPageModule)
          },
          {
            path: 'languages',
            loadChildren: () => import('../languages/languages.module').then(m => m.LanguagesPageModule)
          },
          {
            path: 'edit-profile',
            loadChildren: () => import('../edit-profile/edit-profile.module').then(m => m.EditProfilePageModule)
          },
        ]

      },
      {
        path: '',
        redirectTo: '/tabs/tab1',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/tab1',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule { }
