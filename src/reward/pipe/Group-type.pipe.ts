import {Injectable, Pipe,PipeTransform} from '@angular/core';

@Pipe({
    name: 'groupType'
})
@Injectable()
export class GroupTypePipe implements PipeTransform {
    transform(items: any[], args: any[]): any {
        if(items===undefined) return null;
        return items.filter(item => item.cRPRewardType === args);
    }
}
