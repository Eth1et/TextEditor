import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  private loaderName: string | null = null;

  readonly isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();

  isLoading(): boolean {
    return this.isLoadingSubject.getValue();
  }

  isThisLoading$(name: string): Observable<boolean> {
    return this.isLoadingSubject.pipe(
      map((loading) => loading && this.loaderName === name)
    );
  }

  startLoading(name: string): boolean {
    if (this.isLoading()) return false;
    this.loaderName = name;
    this.isLoadingSubject.next(true);
    return true;
  }

  stopLoading(name: string): boolean {
    if (!this.isLoading() || this.loaderName !== name) return false;
    this.isLoadingSubject.next(false);
    this.loaderName = null;
    return true;
  }
}