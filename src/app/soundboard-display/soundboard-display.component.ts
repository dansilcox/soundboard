import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Sound } from '../models/sound';
import { SoundsService } from '../services/sounds.service';
import { MessagesService } from '../services/messages.service';

@Component({
  selector: 'app-soundboard-display',
  templateUrl: './soundboard-display.component.html',
  styleUrls: ['./soundboard-display.component.scss']
})
export class SoundboardDisplayComponent implements OnInit {
  sounds$: Observable<Sound[]>;

  constructor(private _sounds: SoundsService, private _msg: MessagesService) { 
  }

  ngOnInit() {
    setTimeout(() => this.sounds$ = this._sounds.getSounds(), 0);
  }

  playSound(sound: Sound): void {
    this._sounds.play(sound);
  }

  isPlaying(sound: Sound): boolean {
    return this._sounds.isPlaying(sound);
  }

  fadeOut(sound: Sound): void {
    this._sounds.fadeOut(sound);
  }

  stopAllAudio(): void {
    this._sounds.stopAllAudio();
  }
}
