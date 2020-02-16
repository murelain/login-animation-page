
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { ViewStackComponent } from './viewstack/viewstack.component';
import { UploadButtonComponent } from './upload-button/upload-button.component';
import { BrowserModule } from '@angular/platform-browser';
import { CheckboxComponent } from './checkbox/checkbox.component';
import { VideoRecordingComponent } from './video-recording/video-recording.component';
import { MatTooltipModule, MatRippleModule, MatSelectModule, MatFormFieldModule, MatInputModule } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule, MatIconModule, MatMenuModule } from '@angular/material';
const COMPONENTS = [
    ViewStackComponent,
    UploadButtonComponent,
    CheckboxComponent,
    VideoRecordingComponent

];

@NgModule({
    declarations: [
        ViewStackComponent,
        UploadButtonComponent,
        CheckboxComponent,
        VideoRecordingComponent
    ],
    exports: [
        ViewStackComponent,
        UploadButtonComponent,
        CheckboxComponent,
        VideoRecordingComponent
    ],
    entryComponents: [

    ],
    imports: [
        BrowserModule,
        MatTooltipModule,
        MatRippleModule,
        MatSelectModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatMenuModule
    ],
    providers: [

    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class CommonComponentsModule {
}
