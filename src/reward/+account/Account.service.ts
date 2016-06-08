import {Injectable} from '@angular/core';
import {Http, Response, URLSearchParams, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import {baseUrl} from '../services/config';
// import { Md5 } from 'ts-md5/dist/md5';

const searchUrl = baseUrl + '/rewardCheckUser/list';
const delUrl = baseUrl + '/rewardCheckUser/delete';
const addUrl = baseUrl + '/rewardCheckUser/add';
const editUrl = baseUrl + '/rewardCheckUser/edit';
const queryUrl = baseUrl + '/rewardCheckUser/query/';

@Injectable()
export class AccountService {
    id: number;
    constructor(private http: Http) {
    }

    getOne(id) {
        let search = new URLSearchParams();
        search.set('cRCUId', id);
        return this.http.get(queryUrl, { search: search }).map(res => res.json()).catch(this.handleError);
    }

    /**
     * 新增和修改核验人
     * @param  {[object]} data [插入数据]
     * @return {[Observables]}      [observables 数据]
     */
    add(data) {
        let URL;
        if (data.cRCUId === null || data.cRCUId === undefined || isNaN(data.cRCUId)) {
            URL = addUrl //新增
        } else {
            URL = editUrl //修改
        }
        let body = JSON.stringify(data);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(URL, body, options).map(res => res.json()).catch(this.handleError);
    }

    /**
     * 删除核验人
     * @param  {[number]} id
     * @return {[Observables]}  [observables 数据]
     */
    delete(id) {
        let search = new URLSearchParams();
        search.set('cRCUId', id);
        return this.http.delete(delUrl, { search: search }).map(res => res.json()).catch(this.handleError);
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
     * 核验子账号列表
     * @param  {[object]} params [分页currentPage,pageSize]
     * @return {[Observables]}   [observables 数据]
     */
    list(data) {
        let search = new URLSearchParams();
        search.set('currentPage', data.currentPage);
        search.set('pageSize', data.pageSize);
        return this.http.get(searchUrl, { search: search }).map(res => res.json()).catch(this.handleError);
    }
    /**
     * 发放总量
     * @param  {[object]} id [ID]
     * @return {[Observables]}   [observables 数据]
     */
    totalList(id) {
        let URL = baseUrl+'/rewardManage/check/total/' + id;
        return this.http.get(URL).map(res => res.json()).catch(this.handleError);
    }

    private handleError(error: any) {
        // In a real world app, we might use a remote logging infrastructure
        let errMsg = error.message || 'Server error';
        console.error(errMsg); // log to console instead
        return Observable.throw(errMsg);
    }
}
