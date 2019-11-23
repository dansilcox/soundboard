import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor() { }

  // TODO: implement actual login check if required...
  loggedIn(): boolean {
    return true;
  }
}
