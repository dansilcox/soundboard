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
    this.sounds$ = this._sounds.getSounds();
  }

  playSound(sound: Sound): void {
    this._msg.success('Playing sound ' + sound.title);

    this._sounds.play(sound);
  }

  stopAllAudio(): void {
    this._sounds.stopAllAudio();
  }
}
