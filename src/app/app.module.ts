import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { LayoutComponent } from './common/layout/layout.component';
import { ApplyPageComponent } from './pages/apply-page/apply-page.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonComponentsModule } from './common/common-components.module';
import {
  MatTooltipModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatAutocompleteModule,
  MatRippleModule,
  MatIconModule,
  MatSelectModule,
  MatButtonModule,
  MatFormFieldModule,
  MatInputModule
} from '@angular/material';
import { ReactiveFormsModule } from '@angular/forms';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { AutocompleteInputComponent } from './common/autocomplete-input/autocomplete-input.component';
import { ModalAlertComponent } from './common/modal-alert/modal-alert.component';


export class HammerConfig extends HammerGestureConfig {
  overrides = <any>{
    'swipe': { velocity: 0.4, threshold: 20 },
    'pinch': { enable: false },
    'rotate': { enable: false },
  };
}


@NgModule({
  declarations: [
    AppComponent,
    HomePageComponent,
    LayoutComponent,
    ApplyPageComponent,
    AutocompleteInputComponent,
    ModalAlertComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatRippleModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    FormsModule,
    CommonComponentsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatButtonModule,
  ],
  providers: [{ provide: HAMMER_GESTURE_CONFIG, useClass: HammerConfig },],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class AppModule { }

