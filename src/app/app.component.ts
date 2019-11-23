import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Message } from './models/message';
import { MessagesService } from './services/messages.service';
import { MessageType } from './enums/message-type';
import { IpcRendererService } from './services/ipc-renderer.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Soundboard';
  year = (new Date()).getUTCFullYear();

  // So we can get the enum text value out
  MessageType = MessageType;

  messages$: Observable<Message[]>;
  
  constructor(private _msg: MessagesService, private _ipc: IpcRendererService) {
  }

  ngOnInit() {
    this.messages$ = this._msg.getMessages();
    this._ipc.send('ping');
  }

  clearMessages() {
    this._msg.clearMessages();
  }
}
