import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { Message } from './models/message';
import { MessagesService } from './services/messages.service';
import { MessageType } from './enums/message-type';
import { IpcRendererService } from './services/ipc-renderer.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Soundboard';
  year = (new Date()).getUTCFullYear();

  // So we can get the enum text value out
  MessageType = MessageType;

  messages$: Observable<Message[]>;
  
  private messagesSub: Subscription;
  constructor(private _msg: MessagesService, private _ipc: IpcRendererService) {
  }

  ngOnInit() {
    this.messages$ = this._msg.getMessages();
    this.messagesSub = this.messages$
      .pipe(
        // Only display top 5 messages
        map((val) => val.slice(0, 5))
      )
      .subscribe();
    this._ipc.send('ping');
  }

  clearMessages() {
    this._msg.clearMessages();
  }

  ngOnDestroy() {
    this.messagesSub.unsubscribe();
  }
}
