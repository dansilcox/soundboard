import { Component, OnInit } from '@angular/core';
import { SoundsService } from 'src/app/services/sounds.service';
import { ActivatedRoute } from '@angular/router';
import { Sound } from 'src/app/models/sound';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit {
  sound: Sound = new Sound();
  id: string = '';
  constructor(private _sounds: SoundsService, private _route: ActivatedRoute) { }

  ngOnInit() {
    this.id = this._route.snapshot.paramMap.get('id');

    this.sound = this._sounds.getById(this.id);
  }
}
