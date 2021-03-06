import { Subscription } from 'rxjs/Rx'
import { DynamicDirective } from './dynamic.directive'
import { 
  Component, 
  Input, 
  ViewChild, 
  ComponentFactoryResolver, 
  OnChanges, 
  Type, 
  Output, 
  EventEmitter,
  OnDestroy
} from '@angular/core'

@Component({
  selector: 'dynamic-component',
  template: `
    <div dynamic-host></div>
  `,
})
export class DynamicComponent implements OnChanges, OnDestroy {
  @Input() component: Type<any>
  @Input() rowData: any
  @Output() change = new EventEmitter<any>()
  @ViewChild(DynamicDirective) dynamicHost: DynamicDirective
  private changeSubscription: Subscription
  
  constructor(private resolver: ComponentFactoryResolver) { }

  ngOnChanges() {
    // Create the component factory
    let componentFactory = this.resolver.resolveComponentFactory(this.component)

    const viewRef = this.dynamicHost.viewContainerRef

    // Clear the current component from the view
    viewRef.clear()
    this.clearSubscription()

    // Create a new component and attach it to the view
    let componentRef = viewRef.createComponent(componentFactory)
    componentRef.instance.data = this.rowData
    if (componentRef.instance.change) {
      this.changeSubscription = componentRef.instance.change.subscribe(change => this.change.next(change))
    }
  }

  ngOnDestroy(): void {
    this.clearSubscription();
  }

  private clearSubscription(): void {
    if (this.changeSubscription) {
      this.changeSubscription.unsubscribe()
    }
  }
}
