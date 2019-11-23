import { Component } from '@angular/core';
import { Sound } from 'src/app/models/sound';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddComponent {
  sound: Sound = new Sound();
}
