import {DomSanitizer} from '@angular/platform-browser';
import {Injectable} from '@angular/core';
import {MatIconRegistry} from '@angular/material';

@Injectable()
export class IconRegistryService {

    constructor(reg: MatIconRegistry, s: DomSanitizer) {
        reg.addSvgIcon('full-arrow-down', s.bypassSecurityTrustResourceUrl('/assets/full-arrow-down.svg'));
        reg.addSvgIcon('close', s.bypassSecurityTrustResourceUrl('/assets/close.svg'));
        reg.addSvgIcon('tick', s.bypassSecurityTrustResourceUrl('/assets/tick.svg'));
        reg.addSvgIcon('download', s.bypassSecurityTrustResourceUrl('/assets/download.svg'));
        reg.addSvgIcon('calendar', s.bypassSecurityTrustResourceUrl('/assets/calendar.svg'));
        reg.addSvgIcon('exit', s.bypassSecurityTrustResourceUrl('/assets/exit.svg'));
        reg.addSvgIcon('dollar', s.bypassSecurityTrustResourceUrl('/assets/dollar.svg'));
        reg.addSvgIcon('video', s.bypassSecurityTrustResourceUrl('/assets/video.svg'));
        reg.addSvgIcon('novideo', s.bypassSecurityTrustResourceUrl('/assets/novideo.svg'));
        reg.addSvgIcon('locked', s.bypassSecurityTrustResourceUrl('/assets/locked.svg'));
        reg.addSvgIcon('menu', s.bypassSecurityTrustResourceUrl('/assets/menu.svg'));
        reg.addSvgIcon('search', s.bypassSecurityTrustResourceUrl('/assets/search.svg'));
        reg.addSvgIcon('checkmark', s.bypassSecurityTrustResourceUrl('/assets/checkmark.svg'));

        // Social
        reg.addSvgIcon('facebook', s.bypassSecurityTrustResourceUrl('/assets/social/facebook.svg'));
        reg.addSvgIcon('twitter', s.bypassSecurityTrustResourceUrl('/assets/social/twitter.svg'));
        reg.addSvgIcon('gmail', s.bypassSecurityTrustResourceUrl('/assets/social/gmail.svg'));
        reg.addSvgIcon('yahoo', s.bypassSecurityTrustResourceUrl('/assets/social/yahoo.svg'));
        reg.addSvgIcon('outlook', s.bypassSecurityTrustResourceUrl('/assets/social/outlook.svg'));

        reg.addSvgIcon('facebook-tiny', s.bypassSecurityTrustResourceUrl('/assets/social/footer/facebook-tiny.svg'));
        reg.addSvgIcon('instagram-tiny', s.bypassSecurityTrustResourceUrl('/assets/social/footer/instagram-tiny.svg'));
        reg.addSvgIcon('pinterest-tiny', s.bypassSecurityTrustResourceUrl('/assets/social/footer/pinterest-tiny.svg'));
        reg.addSvgIcon('twitter-tiny', s.bypassSecurityTrustResourceUrl('/assets/social/footer/twitter-tiny.svg'));
        reg.addSvgIcon('youtube-tiny', s.bypassSecurityTrustResourceUrl('/assets/social/footer/youtube-tiny.svg'));

        }
}
