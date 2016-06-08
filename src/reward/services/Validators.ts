import {Control} from '@angular/common';

export class Validators {
  static required(c: Control) {
    return c.value == "" ? {"required": true} : null;
  }
  static ratio(c: Control) {
    return /^((\d|[123456789]\d)(\.\d+)?|100)$/.test(c.value);
  }
}
