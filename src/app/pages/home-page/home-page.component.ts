import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
// import { Auth } from '../../lib/core/auth';
// import { User } from '../../models';

@Component({
    selector: 'edu-home-page',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.scss', './home-page.component.animations.scss']
})
export class HomePageComponent implements OnInit, OnDestroy {

    @ViewChild('searchInput')
    public searchInput: ElementRef;

    @ViewChild('backgroundImage')
    public bgImg: ElementRef;

    public signUpRole: 'student' | 'tutor' = 'student';

    public signUpForm: FormGroup;

    public scrollStep = 0;

    private prevTouchPosition = 0;

    private scrolling = false;

    public sceneClass = 'stage scene0';

    public directionDelta: 1 | -1;

    public totalSteps = 4;

    private transitions = [600, 2400, 600, 1800, 1400, 1600, 1200, 700, 300, 1600, 2500, 800, 400];

    constructor(
        private router: Router) {
        this.signUpForm = new FormGroup({
            role: new FormControl('student', Validators.required),
            email: new FormControl('', Validators.compose([Validators.required, Validators.email]))
        });
    }

    ngOnInit(): void {  
        window.addEventListener('wheel', this.scrollListener, true);
        window.addEventListener('touchmove', this.scrollListener, true);
    }

    ngOnDestroy(): void {
        window.removeEventListener('wheel', this.scrollListener, true);
        window.removeEventListener('touchmove', this.scrollListener, true);
    }

    public scrollListener = (e: any): void => {
        if (this.scrolling) {
            return;
        }

        if (e.type !== 'touchmove' && e.type !== 'wheel') {
            return;
        }

      
        if (e.type === 'wheel') {
            if (e.deltaY > 0) {
                this.directionDelta = 1;
            } else if (e.deltaY < 0) {
                this.directionDelta = -1;
            }
        }

        if (e.type === 'touchmove') {
            this.directionDelta = e.targetTouches[0].clientY > this.prevTouchPosition ? 1 : -1;
            this.prevTouchPosition = e.targetTouches[0].clientY;
        }

        if (this.scrollStep === 0 && this.directionDelta === -1) {
            return;
        }
        if (this.scrollStep === this.totalSteps && this.directionDelta === 1) {
            return;
        }

        this.scrolling = true;

        const showNextAnim = () => {
            setTimeout(() => {
                this.scrollStep += this.scrollStep + this.directionDelta <= this.totalSteps && this.scrollStep + this.directionDelta >= 0 
                                ? this.directionDelta
                                : 0;
                this.scrolling = false;
                this.sceneClass = `stage scene${this.scrollStep} ${this.directionDelta < 0 ? 'reverse' : ''}`;

                if (this.scrollStep % 2 !== 0) {
                    showNextAnim();
                }
            },  this.transitions[this.scrollStep]);
        }

        showNextAnim();
    };

    public keyUpHandler(e: KeyboardEvent): void {
        
        const searchValue: string = (<HTMLInputElement>this.searchInput.nativeElement).value;

        if (e.keyCode === 13) {
            // user pressed enter
            this.router.navigate(['/tutors'], {queryParams: {query: searchValue}});
            return;
        }

         
    }

    public submitSignUp(): void {
        const form = this.signUpForm.getRawValue();
        if (form.role === null || form.role === undefined || form.role === '') {
            return;
        }

        if (form.email === null || form.email === undefined || form.email === '') {
            return;
        }

        let route: string;
        if (form.role === 'student') {
            route = '/register';
        } else if (form.role === 'tutor') {
            route = '/apply';
        }
        this.router.navigate([route], {queryParams: {email: form.email}});
    }

    public onSwipe($event) {
        //todo: implement method
    }
}
