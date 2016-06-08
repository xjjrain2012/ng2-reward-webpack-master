import {Component, Input, NgZone} from '@angular/core';
import {ROUTER_DIRECTIVES, Router, RouteSegment} from '@angular/router';
import {Http, Response, HTTP_PROVIDERS, URLSearchParams } from '@angular/http';
import {TimerWrapper} from '@angular/core/src/facade/async';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';
import * as moment from 'moment';
import * as _ from 'lodash';
import {baseUrl} from '../../services/config';
import { PAGINATION_DIRECTIVES, DATEPICKER_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import {UPLOAD_DIRECTIVES} from 'ng2-uploader/ng2-uploader';


import {PinProgram, PinService, PinParams} from '../Pin.service';
import {Validators} from '../../services/Validators';

const URL = baseUrl + '/ccs/medias/uploadBackgroundImage';

const FILE_URL = baseUrl + '/rewardManage/uploadCheckCode';

const downLoadBase = baseUrl + '/rewardManage/check/export';

@Component({
  moduleId:module.id,
    selector: 'pin-detail',
    templateUrl: 'template.html',
    styleUrls: ['style.min.css'],
    directives: [PAGINATION_DIRECTIVES, DATEPICKER_DIRECTIVES, ROUTER_DIRECTIVES, UPLOAD_DIRECTIVES],
    providers: [PinService, HTTP_PROVIDERS],
    host: {
        '(click)': 'closeDatePicker($event)'
    }
})

export class PinDetailComponent {
    errorMessage: any;
    id: number;
    state: number;
    showDetail: any;
    projectsParams: any;
    prizesParams: any;
    info: any;
    totalList: any;
    projectsList: any;
    curProjectsList: any;
    pinList: any;
    page: any;

    currentPage: number = 1;
    pageSize: number = 10;
    pageCount: number = 0;

    dateShow: any = 0;
    loading: number = 0;

    uploadFile: any;

    fileOptions: Object = {
        url: FILE_URL
    };
    fileProgress: number = 0;
    fileResp: Object;

    uploadFileXls: any;
    zone: any;

    baseUrl: string;

    constructor(private ps: PinService, private router: Router, params: RouteSegment) {
        this.zone = new NgZone({ enableLongStackTrace: false });
        this.id = +params.getParam('id'); //获取URL中的ID
        this.state = +params.getParam('state'); //获取URL中的状态
        this.projectsParams = {};
        this.projectsParams.cRPId = this.id;
        this.projectsParams.queryType = 1;
        this.prizesParams = {};
        this.prizesParams.cRPId = this.id;
        this.prizesParams.projectId = '';
        this.prizesParams.cRPDId = 0;
        this.prizesParams.sendStatus = 0;
        this.prizesParams.verifyStatus = 0;
        this.prizesParams.startDate = moment().format('YYYY-MM-DD');
        this.prizesParams.endDate = moment().format('YYYY-MM-DD');
        this.prizesParams.range = -1;
    }
    onShowDate(event) {
        event.stopPropagation();
        this.dateShow = !this.dateShow;
        this.prizesParams.range = 'custom';
    }

    public closeDatePicker(event) {
        event.stopPropagation();
        this.dateShow = 0;
    }

    moment(date, format) {
        if (date == null) return '';
        return moment(date).format(format||'YYYY-MM-DD');
    }

    momentDate(date): Date {
        return moment(date).toDate();
    }

    onSetRange(range) {
        this.prizesParams.range = range;
        if (range == '-1') {
            this.prizesParams.startDate = moment().format('YYYY-MM-DD');
            this.prizesParams.endDate = moment().format('YYYY-MM-DD');
        } else if (range == '7' || range == '30' || range == '90') {
            this.prizesParams.startDate = moment().subtract(range, 'days').format('YYYY-MM-DD');
            this.prizesParams.endDate = moment().format('YYYY-MM-DD');
        } else if (range === 'currentYear') {
            this.prizesParams.startDate = moment().startOf('year').format('YYYY-MM-DD');
            this.prizesParams.endDate = moment().endOf('year').format('YYYY-MM-DD');
        } else if (range === 'nextYear') {
            this.prizesParams.startDate = moment().add(1, 'y').startOf('year').format('YYYY-MM-DD');
            this.prizesParams.endDate = moment().add(1, 'y').endOf('year').format('YYYY-MM-DD');
        }
    }
    pageChanged(page) {
        this.currentPage = page.page;
        this.pageSize = page.itemsPerPage;
        this.search();
    }

    onDownload() {
        let search = new URLSearchParams();
        let status = '0';

        search.set('cRPId', this.prizesParams.cRPId);
        search.set('cRPDId', this.prizesParams.cRPDId);
        search.set('sendStatus', this.prizesParams.sendStatus);
        search.set('verifyStatus', this.prizesParams.verifyStatus);
        search.set('startDate', this.prizesParams.startDate || '');
        search.set('endDate', this.prizesParams.endDate || '');
        search.set('projectId', this.prizesParams.projectId);
        return downLoadBase + '?' + search;
    }

    onDoneDownload(dId) {
        let search = new URLSearchParams();
        search.set('cRPId', this.prizesParams.cRPId);
        search.set('cRPDId', dId);
        search.set('sendStatus', '2');
        return downLoadBase + '?' + search;
    }

    onExchangeDownload(dId) {
        let search = new URLSearchParams();
        search.set('cRPId', this.prizesParams.cRPId);
        search.set('cRPDId', dId);
        search.set('verifyStatus', '2');
        return downLoadBase + '?' + search;
    }

    onSearch() {
        this.currentPage = 1;
        this.pageSize = 10;
        this.search();
    }

    onDelete() {
        if (!confirm('是否删除该奖励?')) {
            return;
        }
        this.ps.delete(this.id).subscribe(data => {
            if (this.errorAlert(data)) {
                this.toHome();
            }
        }, error => this.handleError);
    }

    onState() {
        if (!confirm('是否变更该奖励状态?')) {
            return;
        }
        this.ps.putState(this.id, this.state === 1 ? 2 : 1).subscribe(data => {
            if (this.errorAlert(data)) {
                alert('奖励状态变更成功');
                this.getOne();
            }
        }, error => this.handleError);
    }

    ngOnInit() {
        this.getOne();
        this.getProjectsList();
        this.getTotalList();
    }

    getOne() {
        this.ps.getOne(this.id).subscribe(data => {
            if (this.errorAlert(data)) {
                this.info = data.data;
                this.state = this.info.cRPStatus;
                // if(this.info.subInfo&&this.info.subInfo.length>0){
                //   this.prizesParams.cRPDId = this.info.subInfo[0].cRPDId;
                // }

            }
        }, error => this.handleError);
    }

    getTotalList() {
        this.ps.totalList(this.id).subscribe(data => {
            if (this.errorAlert(data)) {
                this.totalList = data.data;
            }
        }, error => this.handleError);
    }

    getProjectsList() {
        this.ps.projectsList(this.projectsParams).subscribe(data => {
            if (this.errorAlert(data)) {
                this.projectsList = data.data;
                this.curProjectsList = data.data.filter(data => data.cPStatus === '1');
                if (this.projectsList.length > 0 && this.prizesParams.projectId === '') {
                    this.prizesParams.projectId = this.projectsList[0].cPId;
                }
                if (this.prizesParams.projectId !== undefined) {
                    this.search();
                }
            }
        }, error => this.handleError);
    }

    before(start, end) {
        return moment(start).isBefore(end);
    }
    timeError: any;

    search() {

        if (this.before(this.prizesParams.cRPValidEndDate, this.prizesParams.cRPValidStartDate)) {
            this.timeError = 1;
            return false;
        } else {
            this.timeError = 0;
        }
        this.prizesParams.currentPage = this.currentPage;
        this.prizesParams.pageSize = this.pageSize;
        this.ps.pinList(this.prizesParams).subscribe(data => {
            if (this.errorAlert(data)) {
                this.pinList = data.data;
                // this.prizesParams = data.param;
                this.currentPage = +this.prizesParams.currentPage;
                this.pageSize = +this.prizesParams.pageSize;
                this.pageCount = +this.prizesParams.pageCount;

            }
        }, error => this.handleError);
    }

    onAddFile(tl) {
        if (this.loading) {
            return false;
        }
        this.loading = 1;
        let data: any = {};
        data.cRPId = this.prizesParams.cRPId;
        data.cRPDId = tl.cRPDId;
        data.fileName = tl.fileName;
        this.ps.addTotal(data).subscribe(data => {
            if (data.error.state !== 0) {
                tl.addStatus = 2;
            } else {
                tl.addTotalShow = 0;
                tl.addStatus = 1;
            }
            TimerWrapper.setTimeout(() => {
                tl.addStatus = 0;
                this.getTotalList();
            }, 2000);
        }, error => this.handleError);
    }
    onAddTotal(tl) {
        if (this.loading) {
            return false;
        }
        if (this.checkTotal(tl)) {
            this.loading = 0;
            return false;
        }
        this.loading = 1;
        let data: any = {};
        data.cRPId = this.prizesParams.cRPId;
        data.cRPDId = tl.cRPDId;
        data.fileName = tl.fileName;
        data.additionalNum = isNaN(+tl.additionalNum) ? 0 : +tl.additionalNum;
        this.ps.addTotal(data).subscribe(data => {
            if (data.error.state !== 0) {
                tl.addStatus = 2;
            } else {
                tl.addTotalShow = 0;
                tl.addStatus = 1;
            }
            TimerWrapper.setTimeout(() => {
                tl.addStatus = 0;
                this.getTotalList();
            }, 2000);
        }, error => this.handleError);
    }
    onEnterAddTotal(event, data) {
        if (event.keyCode == 13) {
            this.onAddTotal(data);
        }
    }

    checkTotal(tl) {
        if (tl.additionalNum === '') {
            tl.additionalNumError = 1;
            return true;
        }
        if (!/^([1-9][0-9]{0,4}|100000)$/.test(tl.additionalNum)) {
            tl.additionalNumError = 1;
            return true;
        }
        tl.additionalNumError = 0;
        return false;
    }

    checkUploadFile() {
        return this.info.cRPCodeType === 1 && this.info.cRPGenerateType === 2;
    }

    handleFileUpload(data, tl): void {
        if (data.size > 2 * 1024 * 1024) {
            tl.uploadFile = { error: { state: 2, msg: '图片文件尺寸请小于2M' } };
        } else {
            if (data.response) {
                tl.uploadFileXls = JSON.parse(data.response);
                if (tl.uploadFileXls.error.state === 0) {
                    tl.fileName = tl.uploadFileXls.data.filePath;
                }
                tl.fileResp = data;
                tl.fileProgress = 0;
            }
            this.zone.run(() => {
                tl.fileProgress = data.progress.percent;
            });
        }
    }

    onDelFileName(tl) {
        tl.fileName = '';
        tl.fileProgress = 0;
        tl.uploadFileXls = null;
    }


    errorAlert(data) {
        if (data.error.state !== 0) {
            alert(data.error.msg);
            return false;
        }
        return true;
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
