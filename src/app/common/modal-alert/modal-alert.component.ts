import {Component, ElementRef, EventEmitter, HostBinding, OnInit} from '@angular/core';

@Component({
    selector: 'edu-modal-alert',
    templateUrl: './modal-alert.component.html',
    styleUrls: ['./modal-alert.component.scss']
})
export class ModalAlertComponent implements OnInit {

    @HostBinding('attr.tabindex')
    tabIndex = '1';

    title: string;

    message: string;

    buttons: any;

    result: EventEmitter<any> = new EventEmitter(true);

    constructor(private eref: ElementRef) {
    }

    ngOnInit() {
        /*if (this.buttons && this.buttons.length) {
            return setTimeout(this.focusFirstButton.bind(this));
        }*/

        setTimeout(() => {
            this.eref.nativeElement.focus();
        });
    }

    focusFirstButton() {
        const buttons = this.eref.nativeElement.getElementsByTagName('button');
        if (buttons.length) {
            buttons[0].focus();
            return;
        }
    }
}
