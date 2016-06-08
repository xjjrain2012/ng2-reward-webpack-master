import {Injectable} from '@angular/core';
import {Http, Response, URLSearchParams, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import {baseUrl} from '../services/config';

const BaccaratAddUrl = baseUrl + '/rewardManage/turntable/add';
const BaccaratEditUrl = baseUrl + '/rewardManage/turntable/edit';
const BaccaratInfoUrl = baseUrl + '/rewardManage/info/query/';

@Injectable()
export class BaccaratService {
    id: number;
    constructor(private http: Http) {

    }

    ngOnInit() {

    }

    getOne(id) {
        return this.http.get(BaccaratInfoUrl + id).map(res => res.json()).catch(this.handleError);
    }

    /**
     * 新增和修改大转盘奖励
     * @param  {[object]} data [插入数据]
     * @return {[Observables]}      [observables 数据]
     */
    add(args) {
        let data = Object.assign({},args);
        let URL;
        if (data.cRPId === null || data.cRPId === undefined || isNaN(data.cRPId)) {
            URL = BaccaratAddUrl //新增
        } else {
            URL = BaccaratEditUrl//修改
        }
        //加工数据
        data.cRPNameShow = data.cRPNameShow ? 1 : 0;
        data.cRPSubtitleShow = data.cRPSubtitleShow ? 1 : 0;
        data.cRPBackgroundShow = data.cRPBackgroundShow ? 1 : 0;
        data.cRPDescShow = data.cRPDescShow ? 1 : 0;
        data.cRPNoticeNow = data.cRPNoticeNow ? 1 : 0;
        data.cRPValidNotice = data.cRPValidNotice ? 1 : 0;
        let items = [];
        data.subInfo.forEach(item=>{
          items.push({cRPDId:item.cRPDId,cRPDNameShow:item.cRPDNameShow ? 1 : 0,cRPDSubtitleShow:item.cRPDSubtitleShow ? 1 : 0,cRPDNum:item.cRPDNum,cRPDName:item.cRPDName,cRPDSubtitle:item.cRPDSubtitle,cRPDBackgroundAdd:item.cRPDBackgroundAdd});
        });
        data.subInfo = items;
        let body = JSON.stringify(data);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(URL, body, options).map(res => res.json()).catch(this.handleError);
    }

    /**
     * 删除核验型奖励
     * @param  {[number]} id
     * @return {[Observables]}  [observables 数据]
     */
    delete(id) {
        let URL = baseUrl+'/rewardManage/status/edit';
        let data = { cRPId: id, cRPStatus: 0 };//0删除,1发放中,2暂停中
        let body = JSON.stringify(data);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(URL, body, options).map(res => res.json()).catch(this.handleError);
    }
    /**
     * 发放/暂停核验型奖励
     * @param  {[type]} id
     * @param  {[type]} state [0删除,1发放中,2暂停中]
     * @return {[type]}       [observables 数据]
     */
    putState(id, state) {
        let URL = baseUrl+'/rewardManage/status/edit';
        let data = { cRPId: id, cRPStatus: state };//0删除,1发放中,2暂停中
        let body = JSON.stringify(data);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(URL, body, options).map(res => res.json()).catch(this.handleError);
    }
    /**
     * 关联项目
     * @param  {[object]} params [cRPId,queryType:[1当前正在关联的/2所有的关联的，包括历史]]
     * @return {[Observables]}   [observables 数据]
     */
    projectsList(params) {
        let search = new URLSearchParams();
        search.set('cRPId', params.cRPId);
        search.set('queryType', params.queryType);
        let URL = baseUrl+'/rewardManage/projects/list';
        return this.http.get(URL, { search: search }).map(res => res.json()).catch(this.handleError);
    }
    /**
     * 奖励列表
     * @param  {[object]} params [cRPId,startDate,endDate,projectId,cRPDId]
     * @return {[Observables]}   [observables 数据]
     */
    pinList(params) {
        let search = new URLSearchParams();
        search.set('cRPId', params.cRPId+'');
        search.set('startDate', params.startDate);
        search.set('endDate', params.endDate);
        search.set('projectId', params.projectId+'');
        search.set('currentPage', params.currentPage+'');
        search.set('pageSize', params.pageSize+'');
        let URL = baseUrl+'/rewardManage/check/list';
        return this.http.get(URL, { search: search }).map(res => res.json()).catch(this.handleError);
    }
    /**
     * 发放总量
     * @param  {[object]} id [奖励ID]
     * @return {[Observables]}   [observables 数据]
     */
    totalList(id) {
        let URL = baseUrl+'/rewardManage/check/total/' + id;
        return this.http.get(URL).map(res => res.json()).catch(this.handleError);
    }

    /**
     * 追加数量
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    addTotal(data){
      let URL = baseUrl+'/rewardManage/nums/append';
      let body = JSON.stringify(data);
      let headers = new Headers({ 'Content-Type': 'application/json' });
      let options = new RequestOptions({ headers: headers });
      return this.http.post(URL, body, options).map(res => res.json()).catch(this.handleError);
    }

    private handleError(error: any) {
        // In a real world app, we might use a remote logging infrastructure
        let errMsg = error.message || 'Server error';
        console.error(errMsg); // log to console instead
        return Observable.throw(errMsg);
    }
}
