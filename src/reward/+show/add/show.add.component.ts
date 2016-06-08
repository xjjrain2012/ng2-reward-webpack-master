import {Component, NgZone, HostListener} from '@angular/core';
import {ROUTER_DIRECTIVES, Router, RouteSegment} from '@angular/router';
import { HTTP_PROVIDERS} from '@angular/http';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';
import { JSONP_PROVIDERS } from '@angular/http';
import { FORM_DIRECTIVES, ControlGroup, FormBuilder } from '@angular/common';
import * as moment from 'moment';
import * as _ from 'lodash';
import {UPLOAD_DIRECTIVES} from 'ng2-uploader/ng2-uploader';
import {DATEPICKER_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';


import {baseUrl} from '../../services/config';
import {ShowProgram, ShowService} from '../Show.service';
import {Validators} from '../../services/Validators';
import {TextTohtmlPipe} from '../../pipe/Text.to.html';

const URL = baseUrl + '/medias/uploadBackgroundImage';


@Component({
    moduleId: module.id,
    selector: 'show-add',
    templateUrl: 'template.html',
    styleUrls: ['style.css'],
    directives: [ROUTER_DIRECTIVES, FORM_DIRECTIVES, UPLOAD_DIRECTIVES, DATEPICKER_DIRECTIVES],
    providers: [ShowService, HTTP_PROVIDERS, JSONP_PROVIDERS],
    pipes: [TextTohtmlPipe]
})






export class ShowAddComponent {
    zone: NgZone;
    psForm: ControlGroup;
    program: any;
    errorMessage: any;
    id: number;
    state: number;
    loading: number;
    additionalNum: number;

    uploadedFiles: any[] = [];
    options: Object = {
        url: URL
    };
    basicProgress: number = 0;
    basicResp: Object;
    uploadFile: any;

    totalRewards: any;
    additionalNumControl: any;
    cRPRateContent: any;

    dateShow: any = 0;

    constructor(private ss: ShowService, private router: Router,
        fb: FormBuilder, params: RouteSegment) {
        this.zone = new NgZone({ enableLongStackTrace: false });
        this.id = +params.getParam('id'); // 获取URL中的ID
        this.state = +params.getParam('state'); // 获取URL中的状态
        // 自定义from 验证规则
        this.psForm = fb.group({
            'cRTId': [params.getParam('id')],
            'cRPName': ['', Validators.required],
            'cRPRewardType': [1],
            'cRPSubtitle': [''],
            'cRPNameShow': [1],
            'cRPSubtitleShow': [0],
            'cRPBackgroundAdd': [''],
            'cRPBackgroundShow': [0],
            'cRPDesc': [''],
            'cRPDescShow': [0],
            'cRPValidStartDate': [''],
            'cRPValidEndDate': [''],
            'cRPValidType': [-1],
            'cRPRate': [1],
            'cRPRateContent': [''],
            'totalRewards': [''],
            'additionalNumControl': [''],
        });

        this.totalRewards = this.psForm.controls['totalRewards'];
        this.additionalNumControl = this.psForm.controls['additionalNumControl'];
        this.cRPRateContent = this.psForm.controls['cRPRateContent'];

        // 初始化数据
        this.basicResp = {};
        this.program = new ShowProgram(null, 1, '', 1, '', 0, '', 0, '',
            0, 0, 1, null, null, moment().format('YYYY-MM-DD'),
            moment().format('YYYY-MM-DD'));
    }

    @HostListener('window:click', ['$event'])
    closeDatePicker(event: any) {
        event.stopPropagation();
        this.dateShow = 0;
    }

    onShowDate(event) {
        event.stopPropagation();
        this.dateShow = !this.dateShow;
    }

    onInitDate() {
        this.program.cRPValidStartDate = moment().format('YYYY-MM-DD');
        this.program.cRPValidEndDate = moment().format('YYYY-MM-DD');
    }



    moment(date) {
        if (date == null) { return ''; };
        return moment(date).format('YYYY-MM-DD');
    }

    momentDate(date): Date {
        return moment(date).toDate();
    }

    ngOnInit() {
        this.getProgram();
    }


    handleUpload(data): void {
        if (data.size > 2 * 1024 * 1024) {
            this.uploadFile = { error: { state: 2, msg: '图片文件尺寸请小于2M' } };
        } else {
            if (data.response) {
                this.uploadFile = JSON.parse(data.response);
                this.program.cRPBackgroundAdd = this.uploadFile.data;
                this.basicResp = data;
            }
            this.zone.run(() => {
                this.basicProgress = data.progress.percent;
            });
        }
    }

    onDelImg() {
        this.program.cRPBackgroundAdd = '';
        this.basicProgress = 0;
        this.uploadFile = null;
    }

    getImg() {
        if (this.program.cRPBackgroundAdd && this.program.cRPBackgroundShow) {
            return 'url(\'/' + this.program.cRPBackgroundAdd + '\') no-repeat center center';
        }
    }

    //查询
    getProgram() {
        if (this.id === undefined || isNaN(this.id)) { return null; };
        this.ss.getOne(this.id).subscribe(data => this.setPsForm(data));
    }

    setPsForm(data) {
        this.program = data.data;
        this.program.cRPValidStartDate = this.moment(this.program.cRPValidStartDate);
        this.program.cRPValidEndDate = this.moment(this.program.cRPValidEndDate);
        if (this.program.cRPDesc != null) {
            this.program.cRPDesc = this.program.cRPDesc.replace(/<br\/>/g, '\n');
        }
        if (this.program.cRPBackgroundAdd == '' || this.program.cRPBackgroundAdd == null) {

        } else {
            this.uploadFile = {};
            this.uploadFile.data = this.program.cRPBackgroundAdd;
        }
    }
    addTotaError: any = 0;
    onAddTotal(tl) {
        if (this.loading) {
            return false;
        }
        this.loading = 1;
        let data: any = {};
        data.cRPId = this.program.cRPId;
        data.cRPDId = this.program.subInfo[0].cRPDId;
        data.fileName = this.program.fileName;
        data.additionalNum = isNaN(+this.additionalNum) ? 0 : +this.additionalNum;
        if (data.additionalNum == 0) {
            this.addTotaError = 1;
            return false;
        } else {
            this.addTotaError = 0;
        }
        this.ss.addTotal(data).subscribe(data => {
            this.loading = 0;
            if (data.error.state !== 0) {
                alert(data.error.msg);
                return;
            }
            this.program.totalRewards += +this.additionalNum;
            this.additionalNum = null;
            alert('新增成功');
            // TimerWrapper.setTimeout(() => {
            //   tl.addStatus = 0;
            //   this.getTotalList();
            // }, 5000);
        }, error => this.handleError);
    }
    onEnterAddTotal(event, tl) {
        event.stopPropagation();
        if (event.keyCode == 13) {
            this.onAddTotal(tl);
        }
    }

    before(start, end) {
        return moment(start).isBefore(end);
    }
    timeError: any;

    onSubmit() {
        if (!this.psForm.valid) {
            this.psForm.markAsTouched();
            return false;
        }
        if (this.before(this.program.cRPValidEndDate, this.program.cRPValidStartDate)) {
            this.timeError = 1;
            return false;
        } else {
            this.timeError = 0;
        }
        if (this.loading) {
            return false;
        }
        this.loading = 1;
        if (this.program.cRPDesc != null) {
            this.program.cRPDesc = this.program.cRPDesc.replace(/[\n]/g, '<br/>')
        }
        this.ss.add(this.program).subscribe(
            data => {
                this.loading = 0;
                if (data.error.state !== 0) {
                    alert(data.error.msg);
                    return;
                }
                alert('成功');
                this.toHome();
            },
            error => { this.errorMessage = <any>error; this.loading = 0 });
    }

    private handleError(error: any) {
        this.loading = 0;
        // In a real world app, we might use a remote logging infrastructure
        let errMsg = error.message || 'Server error';
        console.error(errMsg); // log to console instead
        return Observable.throw(errMsg);
    }

    //跳转首页
    toHome() {
        this.router.navigate(['/']);
    }
    //回退
    goBack() {
        window.history.back();
    }
}
