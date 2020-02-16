import { Upload } from './upload';
import { Subject } from './subject';
import * as moment from 'moment';

import { Capitalize } from '../lib/helpers/functions';

export const MEET_ONLINE = 2;
export const MEET_IN_PERSON = 4;

export class UserEmail {

    email: string;
    created: moment.Moment;
    verified: boolean;
}

export class University {


    _id: string;
    name: string;
    country: string;
    countryCode: string;
}

export class TutoringSubject {


    _id: string;
    subject: Subject;
    certificate: Upload;
    verified: boolean;
}

export class TutoringDegree {


    _id: string;


    course: string;


    degree: string;

    university: University;
    certificate: Upload;
    verified: boolean;
}

export class Availability {


    _id: string;
    recurrent: boolean;


    from: moment.Moment;
    to: moment.Moment;
}

export class Tutoring {
    rate: number;

    lesson_buffer: number;

    rating: number;


    meet: number;


    availability: Availability[];

    subjects: TutoringSubject[];

    degrees: TutoringDegree[];

    video: Upload;

    resume: Upload;


    instant_session: boolean;


    instant_booking: boolean;


    hours_taught: number;


    title: string;
}

export class Address {
    address: string;
    city: string;
    state: string;
    zipcode: string;

    toString(): string {
        return `${this.address} ${this.city}, ${this.state}`;
    }
}

export class Profile {


    first_name: string;


    last_name: string;


    about: string;
    avatar: Upload;


    telephone: string;


    resume: string;


    birthday: moment.Moment;


    address: Address;


    employer_identification_number: string;


    social_security_number: string;
}

export class Coordinate {

    lat: number;
    lng: number;
}

export class GeoJSON {


    type: number;


    coordinates: Coordinate;

}

export class UserLocation {
    position: GeoJSON;


    country: string;


    state: string;


    city: string;


    street: string;


    street_number: string;


    postal_code: string;

    constructor(raw?: any) {

        const props = [
            'postal_code',
            'street_number',
            'street',
            'city',
            'state',
            'country',
            'position'
        ];

        for (const key of props) {
            if (typeof (this[key]) === 'undefined') {
                this[key] = '';
            }
        }
    }

    toString(): string {

        let s = '';

        s += this.street;

        if (this.street_number !== '') {
            s += ' ' + this.street_number;
        }

        if (this.city !== '') {
            s += ', ' + this.city;
        }

        if (this.postal_code !== '') {
            s += ' ' + this.postal_code;
        }

        if (this.country !== '') {
            s += ', ' + this.country;
        }

        return s;
    }

    get nice(): string {
        if (this.city === '' && this.country === '') {
            return '';
        }
        if (this.city === '') {
            return this.country;
        }
        if (this.country === '') {
            return this.city;
        }
        return this.city + ', ' + this.country;
    }
}

export class LoginDetails {


    ip: any;


    device: any;


    time: moment.Moment;
}

export interface CreditCard {
    id: string;       // stripe card id
    default: boolean; // default card
    month: number;    // expiration month
    year: number;     // expiration year
    number: string;   // last 4 digits
    type: string;     // card provider
}

export class ReferData {


    referrer: string;


    referral_code: string;
}

export class User {


    _id: string;
    emails: UserEmail[];
    profile: Profile;
    tutoring: Tutoring;
    location: UserLocation;
    role: any;
    preferences: any;
    payments: any;
    timezone: string;


    registered_date: moment.Moment;


    cc: boolean;


    online: number;
    last_login: LoginDetails;


    has_checkr_data: boolean;

    refer: ReferData;

    constructor(user: any) {
        
    }


    get age(): number {
        return moment().diff(this.profile.birthday, 'year');
    }

    get shortName(): string {
        return Capitalize(`${this.profile.first_name} ${this.profile.last_name.substring(0, 1)}.`);
    }

    get name(): string {
        return Capitalize(`${this.profile.first_name} ${this.profile.last_name}`);
    }

    get avatar(): string {
        if (this.profile && this.profile.avatar) {
            return this.profile.avatar.href;
        }
        return 'localhost/avatar.png';
    }

    get email() {
        if (this.emails.length) {
            return this.emails[0].email;
        }

        return '';
    }

    public get card(): null | CreditCard {
        if (this.payments === undefined || this.payments == null || this.cc !== true) {
            return null;
        }

        let defaultCard = (<CreditCard[]>this.payments.cards).find(cc => cc.default === true);
        if (defaultCard === undefined) {
            if (this.payments.cards.length > 0) {
                defaultCard = this.payments.cards[0];
            }
        }
        return defaultCard === undefined ? null : defaultCard;
    }

    hasRole(role: any): boolean {
        if (typeof (role) === 'string') {
            role = { 'admin': 8, 'tutor': 4, 'student': 2 }[role];
        }

        return Number(this.role & role) !== 0;
    }

    public isAdmin(): boolean {
        return this.hasRole(8);
    }

    public isTutor(): boolean {
        return this.hasRole(4);
    }

    public isStudent(): boolean {
        return this.hasRole(2);
    }

    public isAffiliate(): boolean {
        return this.role === 1;
    }

    unverifiedSubjects() {
        const out = [];

        if (!this.tutoring || !this.tutoring.subjects || this.tutoring.subjects.length === 0) {
            return out;
        }

        for (const subject of this.tutoring.subjects) {
            if (!subject.verified) {
                out.push(subject);
            }
        }

        return out;
    }

    unverifiedDegrees() {

        const out = [];

        if (!this.tutoring || !this.tutoring.degrees || this.tutoring.degrees.length === 0) {
            return out;
        }

        for (const degree of this.tutoring.degrees) {
            if (!degree.verified) {
                out.push(degree);
            }
        }

        return out;
    }

    preference(name: string, def: any): any {
        const data = this.preferences || {};
        return data[name] || def;
    }

    canMeet(kind: number): boolean {
        if (this.tutoring === undefined) {
            return false;
        }
        return (this.tutoring.meet & kind) !== 0;
    }

    get canMeetOnline(): boolean {
        return this.canMeet(MEET_ONLINE);
    }

    get canMeetInPerson(): boolean {
        return this.canMeet(MEET_IN_PERSON);
    }

    // get msg(): MessengerUser {
    //     return MessengerUser.fromSystemUser(this);
    // }

    public get hasLocation(): boolean {
        return this.location !== undefined &&
            this.location.position !== undefined &&
            this.location.position.coordinates !== undefined;
    }

    public get profileComplete(): boolean {
        if (this.tutoring === undefined) {
            return false;
        }

        if (this.profile.avatar === undefined) {
            return false;
        }

        if (this.tutoring.rate === undefined) {
            return false;
        }

        if (this.tutoring.subjects === undefined || this.tutoring.subjects === null || this.tutoring.subjects.length === 0) {
            return false;
        }

        if (this.tutoring.degrees === undefined || this.tutoring.degrees === null || this.tutoring.degrees.length === 0) {
            return false;
        }

        if (this.tutoring.availability === undefined || this.tutoring.availability === null || this.tutoring.availability.length === 0) {
            return false;
        }

        return true;
    }
}

export class Transaction {

    _id: string;

    user: User;


    amount: number;


    lesson: string;


    details: string;


    reference: string;


    status: string;


    state: number;


    time: moment.Moment;


    public getState(s: string): number {
        switch (s.toLowerCase().trim()) {
            case 'sent':
                return 0;
            case 'approved':
                return 1;
            case 'pending':
                return 2;
            case 'cancelled':
                return 3;
        }
    }
}

