import {Upload} from '../../models';
import {
    Component,
    OnInit,
    ViewChildren,
    forwardRef,
    ElementRef,
    QueryList,
    AfterViewInit,
    Input
} from '@angular/core';

import {NG_VALUE_ACCESSOR, ControlValueAccessor} from '@angular/forms';

@Component({
    selector: 'edu-upload-button',
    templateUrl: './upload-button.component.html',
    styleUrls: ['./upload-button.component.scss'],
    providers: [
        {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UploadButtonComponent), multi: true}
    ]
})
export class UploadButtonComponent implements OnInit, AfterViewInit, ControlValueAccessor {

    @ViewChildren('fileInput')
    inputQuery: QueryList<ElementRef>;

    @Input()
    context: string;

    @Input()
    placeholder: string;

    @Input()
    extensions: string[];

    @Input()
    mimes: string[];

    public accept: string;

    input: ElementRef;

    file: File;

    uploading: boolean;

    disabled: boolean;

    upload: Upload;

    onChangeFn = (x) => {
    }

    onTouchedFn = () => {
    }

    constructor() {
    }

    ngOnInit() {
        if (!this.context) {
            this.disabled = true;
        }

        this.buildAccept();
    }

    /**
     * Build the accepted filter with the extensions and mimes provided.
     */
    private buildAccept(): void {
        this.accept = '';

        if (Array.isArray(this.extensions)) {
            for (const extension of this.extensions) {
                if (typeof extension !== 'string') {
                    continue;
                }
                this.accept += '.' + extension + ', ';
            }
        }

        if (Array.isArray(this.mimes)) {
            for (const mime of this.mimes) {
                if (typeof mime !== 'string') {
                    continue;
                }
                this.accept += mime + ', ';
            }
        }

        this.accept = this.accept.replace(/[, ]+$/, '');
    }

    ngAfterViewInit() {
        this.inputQuery.changes.subscribe(input => this.input = input);
    }

    onFileChange(event) {
        this.file = event.target.files[0];
        this.uploading = true;
        const data = new FormData();
        data.append('file', this.file);
        data.append('context', this.context);
        this.onTouchedFn();
       
                this.upload = new Upload();
                 
                this.onChangeFn(this.upload);
                this.uploading = false;
   
    }

    /**
     * Delete the selected file.
     */
    delete() {
        this.file = null;
        this.onChangeFn(null);
    }


    /**
     * Write a new value to the element.
     */
    writeValue(value: any): void {

    }

    /**
     * Set the function to be called when the control receives a change event.
     */
    registerOnChange(fn: any): void {
        this.onChangeFn = fn;
    }

    /**
     * Set the function to be called when the control receives a touch event.
     */
    registerOnTouched(fn: any): void {
        this.onTouchedFn = fn;
    }

    /**
     * This function is called when the control status changes to or from "DISABLED".
     * Depending on the value, it will enable or disable the appropriate DOM element.
     *
     * @param isDisabled
     */
    setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
}
