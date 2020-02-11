import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {HomePageComponent} from './pages/home-page/home-page.component';
import {LayoutComponent} from './common/layout/layout.component';
import { ApplyPageComponent } from './pages/apply-page/apply-page.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
        {path: '', component: HomePageComponent, data: {noMenu: true}},
        {path: 'profile', component: HomePageComponent, data: {noMenu: true}},
        {path: 'registry', component: ApplyPageComponent, data: {noMenu: true}},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
