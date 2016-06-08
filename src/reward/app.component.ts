import { Component, OnInit } from '@angular/core';
import { ROUTER_DIRECTIVES, ROUTER_PROVIDERS, Router, Routes } from '@angular/router';

import { HomeComponent } from './+home';
import { CreateComponent } from './+create';
import { ShowAddComponent, ShowDetailComponent } from './+show';
import { PinAddComponent, PinDetailComponent } from './+pin';
import { AccountAddComponent, AccountListComponent } from './+account';
import { BaccaratAddComponent } from './+baccarat';



@Component({
    selector: 'reward-app',
    template: '<router-outlet></router-outlet>',
    directives: [ROUTER_DIRECTIVES],
    providers: [ROUTER_PROVIDERS]
})

@Routes([
    { path: '/', component: HomeComponent },
    { path: '/create', component: CreateComponent },
    { path: '/account/add', component: AccountAddComponent },
    { path: '/account/edit', component: AccountAddComponent },
    { path: '/account/list', component: AccountListComponent },
    { path: '/show/add', component: ShowAddComponent },
    { path: '/show/edit', component: ShowAddComponent },
    { path: '/show/detail', component: ShowDetailComponent },
    { path: '/pin/add', component: PinAddComponent },
    { path: '/pin/edit', component: PinAddComponent },
    { path: '/pin/detail', component: PinDetailComponent },
    { path: '/baccarat/add', component: BaccaratAddComponent },
    { path: '/baccarat/edit', component: BaccaratAddComponent },
    { path: '/baccarat/show/detail', component: ShowDetailComponent },
    { path: '/baccarat/pin/detail', component: PinDetailComponent }
])

export class AppComponent implements OnInit {
    constructor(private router: Router) {

    }
    ngOnInit() {
        // this.router.navigate(['/']);
    }
}
