import { Injectable } from '@angular/core';
import { Sound } from '../models/sound';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpResponse, HttpResponseBase } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { MessagesService } from './messages.service';
import { map } from 'rxjs/operators';
import { SoundCollection } from '../models/sound-collection';

@Injectable({
  providedIn: 'root'
})
export class SoundsApiService {
  private readonly baseUrl = environment.soundsApiBaseUrl;
  private readonly apiKey  = environment.soundsApiKey;
  private readonly soundsPath = '/sounds';

  constructor(private _http: HttpClient, private _msg: MessagesService) {

  }

  getAll(): Observable<Sound[]> {
    return this._http
      .get(
        this.baseUrl + this.soundsPath,
        {
          headers: new HttpHeaders({
            'x-api-key': this.apiKey
          })
        }
      )
      .pipe(
        map((res: SoundCollection) => res.collection)
      );
  }

  getById(id: string): Observable<Sound> {
    return this._http
      .get(
        this.baseUrl + this.soundsPath + '/' + id,
        {
          headers: new HttpHeaders({
            'x-api-key': this.apiKey
          })
        }
      )
      .pipe(
        map((res: Sound) => res)
      );
  }

  create(sound: Sound): Observable<Sound> {
    return this._http
      .post(
        this.baseUrl + this.soundsPath,
        sound,
        {
          headers: new HttpHeaders({
            'x-api-key': this.apiKey
          })
        }
      )
      .pipe(
        map((res: Sound) => res)
      );
  }

  delete(id: string): Observable<boolean> {
    return this._http
      .delete(
        this.baseUrl + this.soundsPath + '/' + id,
        {
          headers: new HttpHeaders({
            'x-api-key': this.apiKey
          }),
          observe: 'response'
        }
      )
      .pipe(
        map((res: HttpResponseBase) => res.status === 204)
      );
  }
}
