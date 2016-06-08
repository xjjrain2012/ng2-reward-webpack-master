import {Component, Input, Output} from '@angular/core';
import {ROUTER_DIRECTIVES, Router, RouteSegment} from '@angular/router';
import {Http, Response, HTTP_PROVIDERS} from '@angular/http';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';
import { FORM_DIRECTIVES, ControlGroup, FormBuilder } from '@angular/common';
import * as moment from 'moment';
import * as _ from 'lodash';
import { Md5 } from 'ts-md5/dist/md5';


import {AccountService} from '../Account.service';
import {Validators} from '../../services/Validators';

@Component({
  moduleId:module.id,
    selector: 'account-add',
    templateUrl: 'template.html',
    styleUrls: ['style.min.css'],
    directives: [ROUTER_DIRECTIVES, FORM_DIRECTIVES],
    providers: [AccountService, HTTP_PROVIDERS],
})

export class AccountAddComponent {
    params: any;
    errorMessage: any;
    subAccount:any;
    id: number;
    checkPwd: string;
    data: any;
    constructor(private as: AccountService, private router: Router, params: RouteSegment) {
        this.params = {};
        this.subAccount = {};
        this.subAccount.cRCUId = this.id = +params.getParam('id');
    }
    ngOnInit() {
        this.getOne();
    }

    getOne() {
        if (this.id === undefined || isNaN(this.id)) return;
        this.as.getOne(this.id).subscribe(data => this.setAccount(data),
            error => { this.errorMessage = <any>error; alert(error) });
    }

    setAccount(data) {
        if (data.error.state !== 0) {
            alert(data.error.msg);
            return;
        }
        data.data.cRCUPassword = '';
        this.subAccount = data.data;
    }

    onSubmit() {
        if (this.subAccount.cRCUPassword === undefined || this.subAccount.cRCUPassword === null || this.subAccount.cRCUPassword === '') {
            alert('密码不能为空');
            return;
        }
        if (this.subAccount.cRCUPassword !== this.checkPwd) {
            alert('2次输入密码不一致');
            return;
        }
        this.data = _.assign({}, this.subAccount); //脱钩
        this.data.cRCUPassword = Md5.hashStr(this.data.cRCUPassword);
        this.as.add(this.subAccount).subscribe(data => {
            if (data.error.state !== 0) {
                alert(data.error.msg);
                return;
            }
            alert('成功');
            this.toHome();
        },
            error => { this.errorMessage = <any>error; alert(error) });
    }

    toHome() {
        this.router.navigate(['/account/list']);
    }
    goBack() {
        window.history.back();
    }
}
