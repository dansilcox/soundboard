import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Sound } from '../models/sound';
import { IpcRendererService } from './ipc-renderer.service';
import { MessagesService } from './messages.service';

@Injectable({
  providedIn: 'root'
})
export class SoundsService {
  private sounds: Sound[] = [];
  private sounds$ = new BehaviorSubject<Sound[]>(this.sounds);

  private audioPlaying: HTMLAudioElement[] = [];

  constructor(private _ipc: IpcRendererService, private _msg: MessagesService) { 
    this._ipc.on('pong', () => console.info('Backend connection OK'));
    this._ipc.on('soundsUpdated', (event, data) => {
      this.sounds = data;
      this.sounds$.next(this.sounds);
    });
  }

  getSounds(): Observable<Sound[]> {
    return this.sounds$.asObservable();
  }

  getById(id: number): Sound {
    return this.sounds.find((x) => x.id === id);
  }

  get(sound: Sound): Sound {
    // TODO: rewrite this UTTER GARBAGE
    return this.sounds.find((x) => (x.id && sound.id && x.id === sound.id) || 
      (x.title && sound.title && x.title === sound.title) || 
      (x.file && sound.file && x.file === sound.file) ||
      (x.url && sound.url && x.url === sound.url));
  }

  soundExists(sound: Sound): boolean {
    return !!this.get(sound);
  }

  add(sound: Sound): void {
    this.sounds.push(sound);
    this.sounds$.next(this.sounds);

    const reader = new FileReader();
    reader.readAsDataURL(sound.file);
    reader.onload = () => {
      sound.fileContents = reader.result.toString();
      this._ipc.send('addSound', sound);
    }

    reader.onerror = error => {
      console.error('Failed to convert File to base64 data URI');
      this._msg.error('Failed to upload file');
    }
  }

  delete(sound: Sound): void {
    this.sounds.splice(this.sounds.indexOf(sound), 1);
    this.sounds$.next(this.sounds);
    this._ipc.send('deleteSound', sound);
  }

  update(sound: Sound): void {
    this.delete(sound);
    this.add(sound);
  }

  play(sound: Sound): void {
    const audio = new Audio();
    audio.src = sound.filepath;
    audio.load();
    audio.play();
    this.audioPlaying.push(audio);
  }

  stopAllAudio(): void {
    this._msg.info('Stopping all audio...');
    this.audioPlaying.forEach((x: HTMLAudioElement) => x.pause());
  }
}
