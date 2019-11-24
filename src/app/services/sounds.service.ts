declare var AudioContext, webkitAudioContext: any; // ADDED

import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Sound } from '../models/sound';
import { IpcRendererService } from './ipc-renderer.service';
import { MessagesService } from './messages.service';
import { AudioWrapper } from '../models/audio-wrapper';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SoundsService {
  private sounds: Sound[] = [];
  private sounds$ = new BehaviorSubject<Sound[]>(this.sounds);

  private audioPlaying: AudioWrapper[] = [];

  constructor(private _ipc: IpcRendererService, private _msg: MessagesService) { 
    this._ipc.on('pong', () => console.info('Backend connection OK'));
    this._ipc.on('soundsUpdated', (event, data) => {
      this.sounds = data;
      this.sounds$.next(this.sounds);
    });
  }

  getSounds(): Observable<Sound[]> {
    return this.sounds$.asObservable().pipe(
      map((original) => original.sort((a, b) => a.recordOrder < b.recordOrder ? -1 : 1))
    );
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

  reorder(sound: Sound, newPosition: number): void {
    this._ipc.send('reorderSound', sound, newPosition);
  }

  play(sound: Sound): void {
    const audio = new Audio();
    audio.src =  '../' + sound.filepath;
    audio.load();
    audio.play();
    this.audioPlaying.push({id: sound.id, audioElement: audio});
  }

  isPlaying(sound: Sound): boolean {
    return !!this.audioPlaying.find((x) => x.id === sound.id);
  }

  fadeOut(sound: Sound, fadeTimeSeconds: number = 2): void {
    const selectedAudio = this.audioPlaying.find((x) => x.id === sound.id);
    if (!selectedAudio) {
      this._msg.warning('Unable to fade out currently playing sound ' + sound.title);
      return;
    }

    // create audio context
    const _AudioContext = AudioContext || webkitAudioContext;
    const audioCtx = new _AudioContext();

    // Create a MediaElementAudioSourceNode
    // Feed the HTMLMediaElement into it
    const source = audioCtx.createMediaElementSource(selectedAudio.audioElement);

    const gainNode = audioCtx.createGain();

    // connect the AudioBufferSourceNode to the gainNode
    // and the gainNode to the destination
    source.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // go down to 0.01 first (for the fade) then pause audio altogether
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + fadeTimeSeconds);
    setTimeout(() => selectedAudio.audioElement.pause(), fadeTimeSeconds * 1000);

    this.audioPlaying.splice(this.audioPlaying.findIndex((x) => x === selectedAudio), 1);
  }

  stopAllAudio(): void {
    this.audioPlaying.forEach((value) => value.audioElement.pause());
    // If audio is playing only in the SoundsService is it really playing...?
    this.audioPlaying = [];
  }
}
