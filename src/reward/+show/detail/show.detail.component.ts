import {Component} from '@angular/core';
import { FORM_DIRECTIVES, ControlGroup, FormBuilder } from '@angular/common';
import {ROUTER_DIRECTIVES, Router, RouteSegment} from '@angular/router';
import {Http, Response, HTTP_PROVIDERS, URLSearchParams } from '@angular/http';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';
import {TimerWrapper} from '@angular/core/src/facade/async';
import * as moment from 'moment';
// import * as _ from 'lodash';

import { PAGINATION_DIRECTIVES, DATEPICKER_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';

import {baseUrl} from '../../services/config';
import {ShowService} from '../Show.service';
import {Validators} from '../../services/Validators';

const URL = baseUrl + '/ccs/medias/uploadBackgroundImage';

const downLoadBase = baseUrl + '/rewardManage/show/export';

@Component({
  moduleId:module.id,
    selector: 'show-detail',
    templateUrl: 'template.html',
    styleUrls: ['style.min.css'],
    directives: [PAGINATION_DIRECTIVES, DATEPICKER_DIRECTIVES, ROUTER_DIRECTIVES, FORM_DIRECTIVES],
    providers: [ShowService, HTTP_PROVIDERS],
    host: {
        '(click)': 'closeDatePicker($event)'
    }
})

export class ShowDetailComponent {
    showForm: ControlGroup;
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
    showList: any;
    page: any;

    currentPage: number = 1;
    pageSize: number = 10;
    pageCount: number = 0;

    dateShow: any = 0;
    additionalNumControl: any;

    loading: number = 0;
    additionalNumError: number = 0;
    timeError: any;

    constructor(private ss: ShowService, private router: Router, params: RouteSegment, fb: FormBuilder) {
        this.showForm = fb.group({
            'additionalNumControl': [''],
        })

        this.id = +params.getParam('id'); //获取URL中的ID
        this.state = +params.getParam('state'); //获取URL中的状态
        this.projectsParams = {};
        this.prizesParams = {};
        this.projectsParams.cRPId = this.id;
        this.prizesParams.projectId = '';
        this.projectsParams.queryType = 1;
        this.prizesParams.cRPId = this.id;
        this.prizesParams.startDate = moment().format('YYYY-MM-DD');
        this.prizesParams.endDate = moment().format('YYYY-MM-DD');
        this.prizesParams.range = -1;

        this.additionalNumControl = this.showForm.controls['additionalNumControl'];
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

    public setPage(pageNo: number): void {
        this.currentPage = pageNo;
    };

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
        search.set('cRPId', this.prizesParams.cRPId);
        search.set('startDate', this.prizesParams.startDate);
        search.set('endDate', this.prizesParams.endDate);
        search.set('projectId', this.prizesParams.projectId);
        return downLoadBase + '?' + search;
    }

    onDoneDownload(dId) {
        let search = new URLSearchParams();
        search.set('cRPId', this.prizesParams.cRPId);
        search.set('cRPDId', dId);
        search.set('cRPStatus', '1');
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
        this.ss.delete(this.id).subscribe(data => {
            if (this.errorAlert(data)) {
                this.toHome();
            }
        }, error => this.handleError);
    }

    onState() {
        if (!confirm('是否变更该奖励状态?')) {
            return;
        }
        this.ss.putState(this.id, this.state === 1 ? 2 : 1).subscribe(data => {
            if (this.errorAlert(data)) {
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
        this.ss.getOne(this.id).subscribe(data => {
            if (this.errorAlert(data)) {
                this.info = data.data;
                this.state = this.info.cRPStatus;
            }
        }, error => this.handleError);
    }

    getTotalList() {
        this.ss.totalList(this.id).subscribe(data => {
            if (this.errorAlert(data)) {
                this.totalList = data.data;
            }
        }, error => this.handleError);
    }

    getProjectsList() {
        this.ss.projectsList(this.projectsParams).subscribe(data => {
            if (this.errorAlert(data)) {
                this.projectsList = data.data;
                this.curProjectsList = data.data.filter(data => data.cPStatus === '1');
                if (this.projectsList.length > 0 && this.prizesParams.projectId === '') {
                    this.prizesParams.projectId = this.projectsList[0].cPId;
                }
                this.search();
            }
        }, error => this.handleError);
    }

    before(start, end) {
        return moment(start).isBefore(end);
    }

    search() {
        if (this.prizesParams.projectId === undefined) {
            return;
        }
        if (this.before(this.prizesParams.endDate, this.prizesParams.startDate)) {
            this.timeError = 1;
            return false;
        } else {
            this.timeError = 0;
        }
        if (this.loading) {
            return false;
        }
        this.loading = 1;
        this.prizesParams.currentPage = this.currentPage;
        this.prizesParams.pageSize = this.pageSize;
        this.ss.showList(this.prizesParams).subscribe(data => {
            this.loading = 0;
            if (this.errorAlert(data)) {
                if (data.data != null) {
                    this.showList = data.data.list;
                    this.page = data.data.page;
                    this.currentPage = +this.page.currentPage;
                    this.pageSize = +this.page.pageSize;
                    this.pageCount = +this.page.pageCount;
                } else {
                    this.showList = [];
                    this.currentPage = 1;
                    this.pageSize = 10;
                    this.pageCount = 0;
                }
            }
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
        this.ss.addTotal(data).subscribe(data => {
            this.loading = 0;
            if (data.error.state !== 0) {
                tl.addStatus = 2;
            } else {
                tl.addStatus = 1;
            }
            TimerWrapper.setTimeout(() => {
                tl.addStatus = 0;
                this.getTotalList();
            }, 2000);
        }, error => this.handleError);
    }
    onEnterAddTotal(event, tl) {
        event.stopPropagation();
        if (event.keyCode == 13) {
            this.onAddTotal(tl);
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

    errorAlert(data) {
        if (data.error.state !== 0) {
            alert(data.error.msg);
            return false;
        }
        return true;
    }

    private handleError(error: any) {
        this.loading = 0;
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
