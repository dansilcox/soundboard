import { Component, OnInit, Input } from '@angular/core';
import { Sound } from 'src/app/models/sound';
import { SoundsService } from 'src/app/services/sounds.service';
import { MessagesService } from 'src/app/services/messages.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-edit-form',
  templateUrl: './add-edit-form.component.html',
  styleUrls: ['./add-edit-form.component.scss']
})
export class AddEditFormComponent implements OnInit {

  private messages: [string, string][] = [];
  
  fileToUpload: File = null;

  @Input()
  sound: Sound;
  
  constructor(private _sounds: SoundsService, private _msg: MessagesService, private _router: Router) { }

  ngOnInit() {
  }

  handleFileInput(files: FileList): void {
    this.fileToUpload = files.item(0);
    this.sound.file = this.fileToUpload;
  }

  onSubmit(): void {
    this._msg.clearMessages();

    if (!this.isValid()) {
      this._msg.warning(this.getMessagesAsString())
      return;
    }
    
    this._sounds.add(this.sound);
    this._router.navigate(['/config']);
  }

  isValid(): boolean {
    this.messages = [];

    if (!this.sound.title) {
      this.messages.push(['title', 'Required']);
      return false;
    }

    if (!this.sound.file) {
      this.messages.push(['file', 'Required']);
      return false;
    }

    if (this._sounds.soundExists(this.sound)) {
      this.messages.push(['song', 'Must be unique']);
      return false;
    }

    return true;
  }

  private getMessagesAsString(): string {
    let msg = '';
    this.messages.forEach(([field, error]) => {
      msg += field + ': ' + error + '; ';
    })
    return msg;
  }
}
