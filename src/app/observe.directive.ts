import { Directive, Input, TemplateRef, ViewContainerRef, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { Observable, Subject, AsyncSubject } from 'rxjs';
import { takeUntil, concatMapTo, finalize } from 'rxjs/operators';

export class ObserveContext<T> {
  $implicit: T;
  observe: T;
}

export class ErrorContext {
  $implicit: Error;
}

@Directive({
  selector: '[observe]'
})
export class ObserveDirective<T> implements OnDestroy, OnInit {
  private errorRef: TemplateRef<ErrorContext>;
  private beforeRef: TemplateRef<null>;
  private unsubscribe = new Subject<boolean>();
  private init = new AsyncSubject<void>();

  constructor(
    private view: ViewContainerRef,
    private nextRef: TemplateRef<ObserveContext<T>>,
    private changes: ChangeDetectorRef
  ) {
  }

  @Input()
  set observe(source: Observable<T>) {
    if (!source) {
      return;
    }
    this.showBefore();
    this.unsubscribe.next(true);
    this.init.pipe(
      concatMapTo(source),
      takeUntil(this.unsubscribe)
    ).subscribe(value => {
      this.view.clear();
      this.view.createEmbeddedView(this.nextRef, {$implicit: value, observe: value});
      this.changes.markForCheck();
    }, error => {
      if (this.errorRef) {
        this.view.clear();
        this.view.createEmbeddedView(this.errorRef, {$implicit: error});
        this.changes.markForCheck();
      }
    });
  }

  @Input()
  set observeError(ref: TemplateRef<ErrorContext>) {
    this.errorRef = ref;
  }

  @Input()
  set observeBefore(ref: TemplateRef<null>) {
    this.beforeRef = ref;
  }

  ngOnDestroy() {
    this.unsubscribe.next(true);
  }

  ngOnInit() {
    this.showBefore();
    this.init.next();
    this.init.complete();
  }

  private showBefore(): void {
    if (this.beforeRef) {
      this.view.clear();
      this.view.createEmbeddedView(this.beforeRef);
    }
  }
}
