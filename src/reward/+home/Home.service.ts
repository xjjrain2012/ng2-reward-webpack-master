import {Injectable} from '@angular/core';
import {Http, Response,Headers, RequestOptions} from '@angular/http';
import { Observable } from 'rxjs/Observable';
import {baseUrl} from '../services/config';

export class RType {
    constructor(public cRTId:number,public cRPRewardType: number, public cRTRewardName?: string, public cRTStatus?: number) {
    }
}

const HomeListUrl =  baseUrl+'/rewardManage/list';

@Injectable()
export class HomeService {
    typelist: RType[];

    constructor(private http: Http) {

    }

    ngOnInit() {

    }

    get() {
        return this.http.get(HomeListUrl).map(res => res.json()).catch(this.handleError);
    }

    add(program) {
        let body = JSON.stringify(program);
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(HomeListUrl, body, options).map(res => res.json()).catch(this.handleError);
    }

    private handleError(error: any) {
        // In a real world app, we might use a remote logging infrastructure
        let errMsg = error.message || 'Server error';
        console.error(errMsg); // log to console instead
        return Observable.throw(errMsg);
    }
}
