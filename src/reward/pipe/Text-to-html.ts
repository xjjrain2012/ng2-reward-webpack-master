import {Injectable, Pipe,PipeTransform} from '@angular/core';

@Pipe({
    name: 'textTohtml'
})
@Injectable()
export class TextTohtmlPipe implements PipeTransform {
    transform(items: any, args: any): any {
        if(items===undefined) return null;
        return items.replace(/[\n]/g,'<br/>');
    }
}
