declare var AudioContext, webkitAudioContext: any; // ADDED

import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Sound } from '../models/sound';
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

  constructor(private _msg: MessagesService) { 
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
      sound.url = reader.result.toString();
    }

    reader.onerror = error => {
      console.error('Failed to convert File to base64 data URI');
      this._msg.error('Failed to upload file');
    }
  }

  delete(sound: Sound): void {
    this.sounds.splice(this.sounds.indexOf(sound), 1);
    this.sounds$.next(this.sounds);
  }

  update(sound: Sound): void {
    this.delete(sound);
    this.add(sound);
  }

  reorder(sound: Sound, newPosition: number): void {
    this.sounds.find((x) => x.id === sound.id).recordOrder = newPosition;
    this.sounds$.next(this.sounds);
  }

  play(sound: Sound): void {
    if (this.isPlaying(sound)) {
      console.log('Sound ' + sound.title + ' already playing');
      return;
    }

    const audio = new Audio();
    audio.src =  '../' + sound.filepath;
    audio.loop = false;
    audio.play();
    this.audioPlaying.push({id: sound.id, audioElement: audio});
    
    audio.onloadedmetadata = (ev) => {
      console.log('Sound: ' + sound.title + ', duration: ' + audio.duration + ' seconds');
      
      setTimeout(() => console.log('END: ' + audio.currentTime), audio.duration * 1000);
    }
    audio.onended = (ev) => this.stop(sound);
  }

  stop(sound: Sound): void {
    if (!this.isPlaying(sound)) {
      console.log('Sound ' + sound.title + ' already stopped');
      return;
    }
    
    const selectedAudio = this.audioPlaying.find((x) => x.id === sound.id);
    if (!selectedAudio) {
      console.error('Couldn\'t find playing sound ' + sound.title);
      return;
    }
    
    selectedAudio.audioElement.pause();
    selectedAudio.audioElement.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAVFYAAFRWAAABAAgAZGF0YQAAAAA=';
    selectedAudio.audioElement.currentTime = 0;
    selectedAudio.audioElement.volume = 0;
    this.audioPlaying.splice(this.audioPlaying.findIndex((x) => x.id === selectedAudio.id), 1);
    console.log('Stopped sound ' + sound.title);
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
