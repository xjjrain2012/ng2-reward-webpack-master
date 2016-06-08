import {Component} from '@angular/core';
import {CORE_DIRECTIVES,NgFor,NgSwitch,NgStyle, NgSwitchWhen, NgSwitchDefault} from '@angular/common';
import {ROUTER_DIRECTIVES,Router} from '@angular/router';
import {Http, Response, HTTP_PROVIDERS} from '@angular/http';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';
import * as moment from 'moment';

import {RType, HomeService} from './Home.service';
import {Validators} from '../services/Validators';

import {GroupTypePipe} from '../pipe/Group.type.pipe';

@Component({
  moduleId:module.id,
    selector: 'home',
    templateUrl:'template.html',
    styleUrls:['style.css'],
    directives: [ROUTER_DIRECTIVES,CORE_DIRECTIVES,NgFor,NgSwitch, NgSwitchWhen, NgSwitchDefault,NgStyle],
    providers: [HomeService,HTTP_PROVIDERS],
    pipes: [ GroupTypePipe ],
})

export class HomeComponent{
  typelist:any;
  run:number;
  all:number;
  params:any;
  errorMessage:any;
  item:RType;
  constructor(private hs: HomeService, private router: Router) {

  }

  ngOnInit(){
    this.getList();
  }

  getImg(tl){
    if(tl.cRPBackgroundAdd&&tl.cRPBackgroundShow){
      let imgUrl = tl.cRPBackgroundAdd;
      // return 'url(/'+imgUrl+') no-repeat center center';
    }
  }

  getList(){
    this.hs.get().subscribe(data=>this.setList(data),error=>this.errorMessage)
  }

  setList(data){
    if (data.error.state !== 0) {
        alert(data.error.msg);
        return;
    }
    this.params = data.params;
    this.typelist=data.data;
    let runList = this.typelist.filter(item=>item.cRPStatus==1);
    this.run = runList.length;
    this.all = this.typelist.length;
  }

  trackByTypelist(index:number,rtype:RType){
    return rtype.cRTId;
  }

  toHome(){
    this.router.navigate(['/']);
  }

  goBack() {
      window.history.back();
  }
}
