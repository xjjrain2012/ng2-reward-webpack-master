import {Injectable} from '@angular/core';
import {Http, Response,URLSearchParams,Headers, RequestOptions} from '@angular/http';
import { Observable } from 'rxjs/Observable';
import {baseUrl} from '../services/config';

export class ShowProgram {
    constructor(public cRPId: number, public cRPRewardType: number, public cRPName?: string, public cRPNameShow?: number,
        public cRPSubtitle?: string, public cRPSubtitleShow?: number, public cRPbackgroundAdd?: string,
        public cRPbackgroundShow?: number, public cRPDesc?: string, public cRPDescShow?: number,
        public cRPValidType?: number, public cRPRate?: number,
        public cRPRateContent?: number, public totalRewards?: number,public cRPValidStartDate?: string,public cRPValidEndDate?: string) {

    }
}

@Injectable()
export class ShowService {
    programs: ShowProgram[];

    constructor(private http: Http) {

    }

    ngOnInit() {

    }
    /**
     * 根据ID查询展示型奖励
     * @param  {[number]} id [ID]
     * @return {[Observables]}      [observables 数据]
     */
    getOne(id) {
        return this.http.get(baseUrl+'/rewardManage/info/query/' + id).map(res => res.json()).catch(this.handleError);
    }

    /**
     * 新增和修改展示型奖励
     * @param  {[object]} data [插入数据]
     * @return {[Observables]}      [observables 数据]
     */
    add(data) {
        let base = baseUrl+'/rewardManage/show/';
        let URL;

        if (data.cRPId === null ||data.cRPId === undefined || isNaN(data.cRPId)) {
            URL = base + 'add' //新增
        } else {
            URL = base + 'edit'//修改
        }
        //加工数据
        data.cRPNameShow = data.cRPNameShow ? 1 : 0;
        data.cRPSubtitleShow = data.cRPSubtitleShow ? 1 : 0;
        data.cRPBackgroundShow = data.cRPBackgroundShow ? 1 : 0;
        data.cRPDescShow = data.cRPDescShow ? 1 : 0;
        let body = JSON.stringify(data);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(URL, body, options).map(res => res.json()).catch(this.handleError);
    }
    /**
     * 删除展示型奖励
     * @param  {[number]} id
     * @return {[Observables]}  [observables 数据]
     */
    delete(id){
      let URL = baseUrl+'/rewardManage/status/edit';
      let data = {cRPId:id,cRPStatus:0};//0删除,1发放中,2暂停中
      let body = JSON.stringify(data);
      let headers = new Headers({ 'Content-Type': 'application/json' });
      let options = new RequestOptions({ headers: headers });
      return this.http.post(URL,body,options).map(res => res.json()).catch(this.handleError);
    }
    /**
     * 发放/暂停展示型奖励
     * @param  {[type]} id
     * @param  {[type]} state [0删除,1发放中,2暂停中]
     * @return {[type]}       [observables 数据]
     */
    putState(id,state){
      let URL = baseUrl+'/rewardManage/status/edit';
      let data = {cRPId:id,cRPStatus:state};//0删除,1发放中,2暂停中
      let body = JSON.stringify(data);
      let headers = new Headers({ 'Content-Type': 'application/json' });
      let options = new RequestOptions({ headers: headers });
      return this.http.post(URL,body,options).map(res => res.json()).catch(this.handleError);
    }
    /**
     * 关联项目
     * @param  {[object]} params [cRPId,queryType:[1当前正在关联的/2所有的关联的，包括历史]]
     * @return {[Observables]}   [observables 数据]
     */
    projectsList(params){
      let search = new URLSearchParams();
      search.set('cRPId', params.cRPId);
      search.set('queryType', params.queryType);
      let URL = baseUrl+'/rewardManage/projects/list';
      return this.http.get(URL,{search:search}).map(res => res.json()).catch(this.handleError);
    }
    /**
     * 奖励列表
     * @param  {[object]} params [cRPId,startDate,endDate,projectId,cRPDId]
     * @return {[Observables]}   [observables 数据]
     */
     showList(params){
      let search = new URLSearchParams();
      search.set('cRPId', params.cRPId);
      search.set('range', params.range);
      search.set('startDate', params.startDate);
      search.set('endDate', params.endDate);
      if(params.range=='-1'){
        search.set('startDate', '');
        search.set('endDate', '');
      }
      search.set('projectId', params.projectId);
      search.set('currentPage', params.currentPage + '');
      search.set('pageSize', params.pageSize + '');
      let URL = baseUrl+'/rewardManage/show/list';
      return this.http.get(URL,{search:search}).map(res => res.json()).catch(this.handleError);
    }
    /**
     * 发放总量
     * @param  {[object]} id [奖励ID]
     * @return {[Observables]}   [observables 数据]
     */
    totalList(id){
      let URL = baseUrl+'/rewardManage/show/total/'+id;
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
