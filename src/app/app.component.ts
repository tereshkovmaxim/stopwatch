import { Component, OnDestroy } from '@angular/core';
import { Subject, interval } from 'rxjs';
import { debounceTime, takeUntil, buffer, map, filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
  title = 'stopwatch';

  isEnabled = false;
  isWait = false;

  time = new Date().setHours(0, 0, 0);

  start$ = new Subject();
  stop$ = new Subject();
  click$ = new Subject();
  doubleClick$ = new Subject();

  clicks$ = this.click$.pipe(
    buffer(
      this.click$.pipe( debounceTime(300) )
    ),
    map( list => list.length ),
    filter( x => x === 2 ),
  )
  
  timer$ = interval(1000).pipe(
    takeUntil(this.start$),
    takeUntil(this.doubleClick$),
    takeUntil(this.stop$),
  )

  constructor() {
    this.clicks$.subscribe( () =>  {
      this.isEnabled = false;
      this.isWait = true;
      this.doubleClick$.next();
    } )
  }

  onStartStop() {
    if (this.isWait) {
      this.start$.next();
      this.isEnabled = true;
      this.isWait = false;
      this.timer$.subscribe( () => this.time += 1000 );
    } else if (this.isEnabled) {
      this.stop$.next();  
      this.isEnabled = false;
    } else {
      this.time = new Date().setHours(0, 0, 0);
      this.start$.next();
      this.isEnabled = true;
      this.timer$.subscribe( () => this.time += 1000 );
    }    
  }

  onReset() {
    if (this.isEnabled) {
      this.isEnabled = !this.isEnabled;
      this.stop$.next();
      this.onStartStop();
    }

    this.time = new Date().setHours(0, 0, 0);
  }

  ngOnDestroy() {
    this.stop$.next();
  }  
}
