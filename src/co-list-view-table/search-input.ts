import {Component, Input, Output, EventEmitter} from 'angular2/core'

@Component({
  selector: 'search-input-cmp',
  template: `<input type='text' (keyup)='valueChange($event)'>`
})
export class SearchInput {
  @Input() field;
  @Output() term = new EventEmitter();

  public valueChange ($event) {
    this.term.emit({
      field: this.field,
      value: $event.target.value
    })
  }
}
