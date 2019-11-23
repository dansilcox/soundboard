import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Sound } from '../models/sound';
import { SoundsService } from '../services/sounds.service';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss']
})
export class ConfigComponent implements OnInit {

  sounds$: Observable<Sound[]>;

  constructor(private _sounds: SoundsService) { }

  ngOnInit() {
    this.sounds$ = this._sounds.getSounds();
  }

  deleteSound(sound: Sound): void {
    event.preventDefault();
    
    if (!confirm('Delete sound ' + sound.title + '?')) {
      return;
    }
    this._sounds.delete(sound);
  }

  playSound(sound: Sound): void {
    event.preventDefault();

    this._sounds.play(sound);
  }

  isPlaying(sound: Sound): boolean {
    event.preventDefault();

    return this._sounds.isPlaying(sound);
  }

  stopSound(sound: Sound): void {
    event.preventDefault();

    this._sounds.fadeOut(sound, 0);
  }
}
