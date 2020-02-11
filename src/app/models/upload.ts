import * as moment from 'moment';

export class Upload {


    _id: string;


    name: string;


    mime: string;


    size: number;


    url: string;


    context: string;


    expire: moment.Moment;

    get href(): string {
        return `https://s3.amazonaws.com/nerdly.io/${this.url}`;
    }
}
