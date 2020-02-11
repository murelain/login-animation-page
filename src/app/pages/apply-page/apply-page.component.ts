
import {Observable} from 'rxjs';
import {AutocompleteInputDataProvider, AutocompleteInputData} from '../../common/autocomplete-input/types';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {Component, OnInit} from '@angular/core';
import {Upload, User} from '../../models';
import {IsSSN, PasswordMatchValidator, PasswordValidator} from '../../lib/helpers/validators';
import {Response} from '@angular/http';
import * as moment from 'moment';


@Component({
    selector: 'edu-apply-page',
    templateUrl: './apply-page.component.html',
    styleUrls: ['./apply-page.component.scss']
})
export class ApplyPageComponent implements OnInit {

    // Step names
    steps = ['Personal Details', 'Education and Subjects', 'Video', 'Legal'];

    // Current apply step
    private _step = 0;
    private lastStep: number = this._step;

    profileForm: FormGroup;
    profileFormErrors: any;

    resumeForm: FormGroup;

    subjectsForm: FormGroup;
    legalForm: FormGroup;
    videoForm: FormGroup;

    passwordForm: FormGroup;
    passwordFormErrors: any;


    /* Upload flag */
    uploadingVideo: boolean;
    videoUpload: Upload;

    /* Submit flag */
    submitting: boolean;

    showRef: boolean;

    public minDate: Date;
    public maxDate: Date;

    public hasSSN = false;

    /**
     * This is filled when user is activated by an admin
     * and user comes back to finalize the registration.
     * In this step a password need to be created
     */
    regtoken: string;

    constructor(private router: Router,
                private route: ActivatedRoute,
                ) {

      

        const min = moment().add(-100, 'years').toDate();
        this.minDate = new Date(min.getFullYear(), min.getMonth(), min.getDate());

        const max = moment().add(-18, 'years').toDate();
        this.maxDate = new Date(max.getFullYear(), max.getMonth(), max.getDate());

        this.initProfieForm();

        // Education
        this.resumeForm = new FormGroup({
            resume: new FormControl(null, Validators.required)
        });
              // End of education

        // Legal
        const legalFormLocalStorage = JSON.parse(localStorage.getItem('logalForm') || '{}');
        this.legalForm = new FormGroup({
            agree_terms_privacy: new FormControl(legalFormLocalStorage.agree_terms_privacy, Validators.requiredTrue),
            ssn: new FormControl(legalFormLocalStorage.ssn, Validators.compose([Validators.required, IsSSN])),
        });
        this.legalForm.valueChanges.subscribe(this.localStorageUpdate.bind(this, 'logalForm'));
        // End of Legal

        // Video
        this.videoForm = new FormGroup({
            video: new FormControl(''),
            agree: new FormControl(true),
        });
        // End of video

        this.passwordForm = new FormGroup({
            password: new FormControl('', Validators.compose([Validators.required, Validators.minLength(8), PasswordValidator])),
            check: new FormControl('', Validators.compose([Validators.required])),
        }, PasswordMatchValidator('password', 'check'));
    }

    ngOnInit(): void {
        let initialRun = true; // only check for query email the first time
        this.route.queryParams.subscribe(query => {
            if (query.code !== null && query.code !== undefined && query.code !== '') {
                this.profileForm.get('referrer').setValue(query.code);
            }

            if (query.regtoken) {
                this.regtoken = query.regtoken;
                this._step = 5;
                return;
            }

            let step = 0;
            if (query.step !== undefined) {
                step = parseInt(query.step, 10) - 1;
                if (!this.isCorrectStep(step)) {
                    this.router.navigate([], {queryParams: {step: this.lastStep + 1}});
                    return;
                }
            }

            this._step = step;
            if (this._step > this.lastStep) {
                this.lastStep = this._step;
            }

            if (initialRun && query.email !== null && query.email !== undefined && query.email !== '') {
                this.profileForm.get('email').setValue(query.email);
            }
            initialRun = false;
        });
    }

    initProfieForm() {
        const profileFormLocalStorage = JSON.parse(localStorage.getItem('profileForm') || '{}');
        const locationLocalStorage = profileFormLocalStorage.location || {};

        this.profileForm = new FormGroup({
            first_name: new FormControl(profileFormLocalStorage.first_name, Validators.required),
            last_name: new FormControl(profileFormLocalStorage.last_name, Validators.required),
            birthday: new FormControl(profileFormLocalStorage.birthday  || moment(), Validators.required),
            email: new FormControl(profileFormLocalStorage.email, Validators.compose([Validators.required, Validators.email])),

            location: new FormGroup({
                position: new FormGroup({
                    type: new FormControl(locationLocalStorage ? locationLocalStorage.type : ''),
                    coordinates: new FormGroup({
                        lat: new FormControl(locationLocalStorage.coordinates ? locationLocalStorage.coordinates.lat : 0),
                        lng: new FormControl(locationLocalStorage.coordinates ? locationLocalStorage.coordinates.lng : 0),
                    }),
                }),
                postal_code: new FormControl(locationLocalStorage.postal_code, Validators.required),
                street_number: new FormControl(locationLocalStorage.street_number),
            }),

            referrer: new FormControl('', Validators.pattern(/[0-9a-zA-Z]+/)),
        });


        if (!this.isObjectEmpty(profileFormLocalStorage)) {
            this.profileForm.markAsDirty();
            this.validateProfileForm();
        }

        this.profileForm.valueChanges.subscribe(this.validateProfileForm.bind(this));

        this.profileForm.valueChanges.subscribe(this.localStorageUpdate.bind(this, 'profileForm'))
    }

    get step(): number {
        return this._step;
    }

    set step(step: number) {
        this.router.navigate([], {queryParams: {step: step + 1}});
    }

    isObjectEmpty(obj: any): boolean {
       return Object.keys(obj).length === 0 && obj.constructor === Object;
    }

    onLocationChange(field: string) {
    }

    localStorageUpdate(itemName, formGroup: FormGroup) {
        localStorage.setItem(itemName, JSON.stringify(formGroup))
    }

    validateProfileFormGroup(group: FormGroup) {
        for (const i in group.controls) {
            const control = group.controls[i];
            if (control instanceof FormGroup) {
                this.validateProfileFormGroup(control);
                continue;
            }

            if (control.touched && !control.valid) {
                this.profileFormErrors[i] = control.errors;
            }
        }
    }

    validateProfileForm() {
        this.profileFormErrors = {};
        this.validateProfileFormGroup(this.profileForm);
    }

    isVideoRecordingSupported(): boolean {
        return !!(navigator.getUserMedia || navigator['webkitGetUserMedia'] ||
            navigator['mozGetUserMedia'] || navigator['msGetUserMedia']);
    }

    public get videoNextDisabled(): boolean {
        if (!this.isVideoRecordingSupported()) {
            return false;
        }

        return !this.videoForm.valid || this.uploadingVideo;
    }

    saveProfile() {
        this.validateProfileForm();
        if (!this.profileForm.valid) {
            return false;
        }
        this.step++;
    }

    onViewStackChange(arg) {
        console.log('sss', arg)
    }

    saveSubjects() {
        const data = this.subjectsForm.getRawValue();

        if (!data.subjects || data.subjects.length === 0) {
         
            return;
        }

        this.step++;

        if (!this.isVideoRecordingSupported()) {
            this.step++;
        }
    }

    isCorrectStep(step: number) {
        if (step < 0) {
            return false;
        }

        if (step > 2) {
            return !this.videoForm.pristine;
        }

        if (step > 1) {
            return !this.subjectsForm.pristine;
        }

        if (step > 0) {
            return !this.profileForm.pristine;
        }

        return true;
    }

    getVideoFileName() {
        const first_name: string = this.profileForm.get('first_name').value;
        const last_name: string = this.profileForm.get('first_name').value;
        return first_name.toLowerCase() + '_' + last_name.toLowerCase() + '_' + (new Date()).getTime() + '.webm';
    }

    uploadVideo(force?: boolean) {
        if (!force && this.videoUpload) {
            this.step++;
            return;
        }

        const raw: any = this.videoForm.getRawValue();
        this.uploadingVideo = true;
        const data = new FormData();
        data.append('file', raw.video, this.getVideoFileName());
        data.append('context', 'applying');
        
    }

    public submit() {
        if (this.legalForm.invalid) {
           
            return;
        }

        this.submitting = true;

        const subjects = this.subjectsForm.get('subjects').value || [];

        const payload = {
            ...this.profileForm.getRawValue(),
            social_security_number: this.legalForm.get('ssn').value,
            subjects: subjects.map(s => s._id),
            video: this.videoUpload,
            resume: this.resumeForm.get('resume').value,
            agree: this.videoForm.get('agree').value,
        };

       
    }

    createPassword() {
        const access_token = this.regtoken;
        const password = this.passwordForm.get('password').value;
        
    }

    public setNavigationStep(i: number): void {
        if (this.regtoken === undefined) {
            this.step = i;
        }
    }
}
