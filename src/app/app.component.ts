import { Component } from '@angular/core';
import { delay, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

export interface User {
  name: string;
  age: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  users: User[] = [
    {
      name: 'hello',
      age: 1
    },
    {
      name: 'hi',
      age: 21
    },
    {
      name: 'goodbye',
      age: 73
    }
  ];

  usersStream$: Observable<User[]> = of(this.users).pipe(delay(3000));

  createError() {
    this.usersStream$ = of(this.users).pipe(
      delay(2000),
      tap(() => {
        throw new Error("oops");
      })
    );
  }

  createUsersSuccess() {
    this.usersStream$ = null;
    this.usersStream$ = of(this.users).pipe(delay(3000));
  }
}
