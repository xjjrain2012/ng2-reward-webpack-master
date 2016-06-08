import {Component} from '@angular/core';
import {CORE_DIRECTIVES,NgFor,NgSwitch, NgSwitchWhen, NgSwitchDefault} from '@angular/common';
import {ROUTER_DIRECTIVES,Router} from '@angular/router';
import {Http, Response, HTTP_PROVIDERS} from '@angular/http';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';
import * as moment from 'moment';
import { PAGINATION_DIRECTIVES, DATEPICKER_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';

import {AccountService} from '../Account.service';
import {Validators} from '../../services/Validators';

@Component({
  moduleId:module.id,
    selector: 'account-list',
    templateUrl:'template.html',
    styleUrls:['style.min.css'],
    directives: [PAGINATION_DIRECTIVES,ROUTER_DIRECTIVES,CORE_DIRECTIVES,NgFor,NgSwitch, NgSwitchWhen, NgSwitchDefault],
    providers: [AccountService,HTTP_PROVIDERS]
})

export class AccountListComponent{
  list:any;
  params:any;
  errorMessage:any;
  page:any;


  currentPage: number = 1;
  pageSize: number = 10;
  pageCount: number = 0;

  constructor(private as: AccountService, private router: Router) {
    this.params = {};
    this.params.currentPage = 1;
    this.params.pageSize = 10;
  }

  pageChanged(page) {
      this.currentPage = page.page;
      this.pageSize = page.itemsPerPage;
      this.getList();
  }

  ngOnInit(){
    this.getList();
  }

  getList(){
    this.params.currentPage = this.currentPage;
    this.params.pageSize = this.pageSize;
    this.as.list(this.params).subscribe(data=>this.setList(data),error=>this.errorMessage)
  }

  onDelete(subUser){
    if(subUser.delSubmitText!=='delete'){
      alert('正确填写确认信息,delete');
      return;
    }
    this.as.delete(subUser.cRCUId).subscribe(data=>{
      alert(data.error.msg);
      this.getList();
    },error=>this.errorMessage)
  }

  setList(data){
    if (data.error.state !== 0) {
        alert(data.error.msg);
        return;
    }
    if(data!=null&&data!='null'&&data.data&&data.data.list){
      this.list=data.data.list;
      this.page=data.data.page;
      this.currentPage = +data.data.page.currentPage;
      this.pageSize = +data.data.page.pageSize;
      this.pageCount = +data.data.page.pageCount;
    }
  }

  toHome(){
    this.router.navigate(['/']);
  }

  goBack() {
      window.history.back();
  }
}
