import {Component, Input, Output, NgZone} from '@angular/core';
import {ROUTER_DIRECTIVES, Router, RouteSegment} from '@angular/router';
import {Http, Response, HTTP_PROVIDERS} from '@angular/http';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';
import { Jsonp, URLSearchParams, JSONP_PROVIDERS } from '@angular/http';
import { FORM_DIRECTIVES, ControlGroup, FormBuilder } from '@angular/common';
import * as moment from 'moment';
import * as _ from 'lodash';
import {UPLOAD_DIRECTIVES} from 'ng2-uploader/ng2-uploader';

import {baseUrl} from '../../services/config';
import { BaccaratService } from '../Baccarat.service';
import {Validators} from '../../services/Validators';
import {TextTohtmlPipe} from '../../pipe/Text.to.html';
import { PAGINATION_DIRECTIVES, DATEPICKER_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';

const URL = baseUrl + '/medias/uploadBackgroundImage';
const FILE_URL = baseUrl + '/rewardManage/uploadCheckCode';

@Component({
    moduleId:module.id,
    selector: 'baccarat-add',
    templateUrl: 'template.html',
    styleUrls: ['style.min.css'],
    directives: [ROUTER_DIRECTIVES, FORM_DIRECTIVES, UPLOAD_DIRECTIVES, DATEPICKER_DIRECTIVES],
    providers: [BaccaratService, HTTP_PROVIDERS, JSONP_PROVIDERS],
    pipes: [TextTohtmlPipe],
    host: {
        '(click)': 'closeDatePicker($event)'
    }
})

export class BaccaratAddComponent {
    zone: NgZone;
    bsForm: ControlGroup;
    subForm: ControlGroup;
    baccarat: any;
    errorMessage: any;
    id: number;
    loading: number;

    options: Object = {
        url: URL
    };
    basicProgress: number = 0;
    basicResp: Object;
    uploadFile: any;

    fileOptions: Object = {
        url: FILE_URL
    };
    fileProgress: number = 0;
    fileResp: Object;
    uploadFileXls: any;

    dateShow: any;
    currentPage: any;
    cRPRateContent: any;

    baseUrl: string;

    timeError: any=0;
    nameError: any=0;
    state: number=0;

    constructor(private bs: BaccaratService, private router: Router, fb: FormBuilder, params: RouteSegment) {
        this.zone = new NgZone({ enableLongStackTrace: false });
        this.id = +params.getParam('id');
        this.state = +params.getParam('state'); //获取URL中的状态
        this.subForm = fb.group({
            'cRPDName': ['', Validators.required],
            'cRPDSubtitle': [''],
            'cRPDNum': [''],
            'cRPBackgroundShow': [0],
            'cRPDBackgroundAdd': [''],
        });
        this.bsForm = fb.group({
            'cRPName': ['', Validators.required],
            'cRPSubtitle': [''],
            'cRPNameShow': [1],
            'cRPSubtitleShow': [0],
            'cRPBackgroundAdd': [''],
            'cRPBackgroundShow': [0],
            'cRPExchangeType': [1],
            'cRPDesc': [''],
            'cRPDescShow': [0],
            'cRPValidDate': [moment().format('YYYY-MM-DD') + '-' + moment().format('YYYY-MM-DD')],
            'cRPValidStartDate': [moment().format('YYYY-MM-DD')],
            'cRPValidEndDate': [moment().format('YYYY-MM-DD')],
            'cRPValidType': [-1],
            'cRPRate': [1],
            'cRPRateContent': ['', Validators.ratio],
            'totalRewards': [''],
            'cRPCodeType': [1],
            'cRPCodeCommon': [''],
            'cRPGenerateType': [1],
            'fileName': [''],
            'cRPNoticeNow': [1],
            'cRPNoticeNowContent': ['奖励领取验证码{验证码}，恭喜您获得由{品牌名}提供的的{奖品名称}一份，有效期{生效日期}至{失效日期}。'],
            'cRPValidNotice': [1],
            'cRPValidNoticeDay': [3],
            'cRPValidNoticeContent': ['奖励领取验证码{验证码}，您获得的由{品牌名}提供的的{奖品名称}将在{失效日}到期，请及时兑换。'],
        });
        this.cRPRateContent = this.bsForm.controls['cRPRateContent'];
        this.baseUrl = baseUrl;
    }

    ngOnInit() {
        this.baccarat = {};
        this.baccarat.cRPValidDate = moment().format('YYYY-MM-DD') + '-' + moment().format('YYYY-MM-DD');
        this.baccarat.cRPExchangeType = 2;
        this.baccarat.cRPValidType = -1;
        this.baccarat.cRPRate = 1;
        this.baccarat.cRPCodeType = 1;
        this.baccarat.cRPGenerateType = 1;
        this.baccarat.cRPValidNoticeDay = 3;
        this.baccarat.cRPNoticeNowContent = '奖励领取验证码{验证码}，恭喜您获得由{品牌名}提供的的{奖品名称}一份，有效期{生效日期}至{失效日期}'
        this.baccarat.cRPValidNoticeContent = '奖励领取验证码{验证码}，您获得的由{品牌名}提供的的{奖品名称}将在{失效日}到期，请及时兑换。'
        this.baccarat.cRPValidStartDate = moment().format('YYYY-MM-DD');
        this.baccarat.cRPValidEndDate = moment().format('YYYY-MM-DD');
        this.baccarat.range = -1;

        this.baccarat.subInfo = [{}, {}, {}];

        this.getPinProgram();
    }

    onShowDate(event) {
        event.stopPropagation();
        this.dateShow = !this.dateShow;
    }

    public closeDatePicker(event) {
        event.stopPropagation();
        this.dateShow = 0;
    }

    public setPage(pageNo: number): void {
        this.currentPage = pageNo;
    };

    moment(date) {
        if (date == null) return '';
        return moment(date).format('YYYY-MM-DD');
    }

    momentDate(date): Date {
        return moment(date).toDate();
    }

    handleBasicUpload(data, index): void {
        let sb = this.baccarat.subInfo[index];
        if (data.size > 2 * 1024 * 1024) {
            sb.uploadFile = { error: { state: 2, msg: '图片文件尺寸请小于2M' } };
        } else {
            if (data && data.response) {
                sb.uploadFile = JSON.parse(data.response);
                sb.cRPDBackgroundAdd = sb.uploadFile.data;
            }
            sb.basicResp = data;
            this.zone.run(() => {
                sb.basicProgress = data.progress.percent;
            });
        }
    }

    handleFileUpload(data): void {
        if (data.response) {
            this.uploadFileXls = JSON.parse(data.response);
            if (this.uploadFileXls.error.state === 0) {
                this.baccarat.fileName = this.uploadFileXls.data.filePath;
            }
            this.fileResp = data;
        }
        this.zone.run(() => {
            this.fileProgress = data.progress.percent;
        });
    }

    onDelFileName() {
        this.baccarat.fileName = '';
        this.fileProgress = 0;
        this.uploadFileXls = {};
    }

    onDelImg(i) {
        let sb = this.baccarat.subInfo[i];
        sb.cRPDBackgroundAdd = '';
        sb.basicProgress = 0;
        sb.uploadFile = null;
    }

    getImg(subinfo) {
        return 'url(\'/' + subinfo.cRPDBackgroundAdd + '\') no-repeat center center';
    }


    getPinProgram() {
        if (this.id === undefined || isNaN(this.id)) return;
        this.bs.getOne(this.id).subscribe(data => this.setPsForm(data));
    }

    setPsForm(data) {
        this.baccarat = data.data;
        this.baccarat.cRPValidStartDate = this.moment(this.baccarat.cRPValidStartDate);
        this.baccarat.cRPValidEndDate = this.moment(this.baccarat.cRPValidEndDate);
        if (this.baccarat.cRPDesc != null) {
            this.baccarat.cRPDesc = this.baccarat.cRPDesc.replace(/<br\/>/g, '\n');
        }
        this.baccarat.subInfo.forEach(function(item,i){
          if(item.cRPDBackgroundAdd==''||item.cRPDBackgroundAdd==null){

          }else{
            item.uploadFile = {};
            item.uploadFile.data = item.cRPDBackgroundAdd;
          }
        });
    }

    before(start, end) {
        return moment(start).isBefore(end);
    }

    checkNum(data, target) {
        if (/^([1-9][0-9]{0,4}|100000)$/.test(data)) {
            target.numberError = 0;
        } else {
            target.numberError = 1;
        }
    }



    onSubmit() {
        let error: number = 0;
        if (!this.bsForm.valid) {
            this.bsForm.markAsTouched();
            return false;
        }
        if(this.baccarat.cRPName!=null&&_.trim(this.baccarat.cRPName)==''){
          this.nameError = 1;
          return false;
        }else{
          this.nameError = 0;
        }
        if (this.before(this.baccarat.cRPValidEndDate, this.baccarat.cRPValidStartDate)) {
            this.timeError = 1;
            return false;
        } else {
            this.timeError = 0;
        }
        this.baccarat.subInfo.forEach(item => {
            this.checkNum(item.cRPDNum, item);
            if (item.numberError) {
                error += 1;
                return false;
            }
            if(_.trim(item.cRPDName)==''){
              item.subNameError = 1;
              error += 1;
              return false;
            }else{
              item.subNameError = 0;
            }
        })
        if (error) {
            return false;
        }
        if (this.loading) {
            return false;
        }
        this.loading = 1;
        if (this.baccarat.cRPDesc != null) {
            this.baccarat.cRPDesc = this.baccarat.cRPDesc.replace(/[\n]/g, '<br/>');
        }
        this.bs.add(this.baccarat).subscribe(data => {
            this.loading = 0;
            if (data.error.state !== 0) {
                alert(data.error.msg);
                return;
            }
            alert('成功');
            this.toHome();
        },
            error => { this.errorMessage = <any>error; alert(error); this.loading = 0; });
    }
    addTotaError: any = 0;
    onAddTotal(subinfo) {
        let data: any = {};
        data.cRPId = this.baccarat.cRPId;
        data.cRPDId = subinfo.cRPDId;
        data.fileName = this.baccarat.fileName;
        data.additionalNum = isNaN(+subinfo.additionalNum) ? 0 : +subinfo.additionalNum;
        if (data.additionalNum == 0) {
            subinfo.addTotaError = 1;
            return false;
        } else {
            subinfo.addTotaError = 0;
        }
        this.bs.addTotal(data).subscribe(data => {
            if (data.error.state !== 0) {
                alert(data.error.msg);
                return;
            }
            alert('新增成功');
            subinfo.cRPDNum += +subinfo.additionalNum;
            subinfo.additionalNum = '';
            // TimerWrapper.setTimeout(() => {
            //   tl.addStatus = 0;
            //   this.getTotalList();
            // }, 5000);
        }, error => this.handleError);
    }
    onEnterAddTotal(event, subinfo) {
        event.stopPropagation();
        if (event.keyCode == 13) {
            this.onAddTotal(subinfo);
        }
    }

    onAddSubInfo() {
        if (this.baccarat.subInfo.length > 7) {
            return;
        }
        this.baccarat.subInfo.push({});
    }

    onDeleteSubInfo(i) {
        this.baccarat.subInfo.splice(i, 1);
    }

    getTotal() {
        let total: number = 0;
        this.baccarat.subInfo.forEach(item => total += isNaN(+item.cRPDNum)?0:+item.cRPDNum);
        return total || 0;
    }



    private handleError(error: any) {
        // In a real world app, we might use a remote logging infrastructure
        let errMsg = error.message || 'Server error';
        console.error(errMsg); // log to console instead
        return Observable.throw(errMsg);
    }

    toHome() {
        this.router.navigate(['/']);
    }
    goBack() {
        window.history.back();
    }
}
