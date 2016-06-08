import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES, Router} from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { HTTP_PROVIDERS }  from '@angular/http';
import 'rxjs/Rx';

import {RewardType, RewardTypeService} from './RewardType.service';

@Component({
  moduleId:module.id,
    selector: 'create',
    templateUrl: 'template.html',
    styleUrls: ['style.css'],
    directives: [ROUTER_DIRECTIVES],
    providers: [RewardTypeService, HTTP_PROVIDERS],
})

export class CreateComponent {
    list: RewardType[];
    type: number;

    constructor(private rt: RewardTypeService, private router: Router) {
      this.type = 1;
    }

    errorMessage: string;

    ngOnInit() { this.getList(); }

    getList() {
        this.rt.getRewardtypes().subscribe(
            heroes => { this.list = heroes },
            error => this.errorMessage = <any>error);
    }

    onSelect(item: RewardType) {
        if (item.status === 0) return;
        this.type = item.type;
        this.rt.updateChecked(item.type, this.list);
    }

    routerUrl(type: number) {
        let router;
        switch (type) {
            case 1: router = '/show/add';
                break;
            case 2: router = '/pin/add';
                break;
            case 3: router = '/baccarat/add';
                break;
            case 4: router = '/';
                break;
            case 5: router = '/';
                break;
            case 6: router = '/';
                break;
            case 7: router = '/';
                break;
            case 8: router = '/';
                break;
            default:
                router = '/create';
        }
        this.router.navigate([router]);
    }

    redirectTo() {
        this.list.map(data => { if (data.isChecked) { this.routerUrl(data.type) } });
    }

    goBack() {
        window.history.back();
    }

}
