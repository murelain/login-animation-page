

import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';

import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';



@Component({
    selector: 'edu-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit, OnDestroy {
    public APIDomain: string;
    public MSGDomain: string;

    public noMenu = false;
    public noScroll = false;

    constructor(private router: Router,
                private activatedRoute: ActivatedRoute,
           
                private cdRef: ChangeDetectorRef,
                ) {

       
    }

    ngOnInit(): void {
     
    }
    ngOnDestroy(): void {
      
    }

}
