import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Message } from '../models/message';
import { MessageType } from '../enums/message-type';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  private messages: Message[] = [];

  private messages$ = new BehaviorSubject<Message[]>(this.messages);

  constructor() { }

  clearMessages(): void {
    this.messages = [];
    this.messages$.next(this.messages);
  }
  
  getMessages(): Observable<Message[]> {
    return this.messages$.asObservable();
  }

  success(message: string): void {
    this.addMessage(MessageType.Success, message);
  }

  debug(message: string): void {
    this.addMessage(MessageType.Debug, message);
  }

  info(message: string): void {
    this.addMessage(MessageType.Info, message);
  }

  notice(message: string): void {
    this.addMessage(MessageType.Notice, message);
  }

  warning(message: string): void {
    this.addMessage(MessageType.Warning, message);
  }

  error(message: string): void {
    this.addMessage(MessageType.Error, message);
  }

  critical(message: string): void {
    this.addMessage(MessageType.Critical, message);
  }

  emergency(message: string): void {
    this.addMessage(MessageType.Emergency, message);
  }
  
  private addMessage(type: MessageType, text: string): void {
    const msg = new Message();
    msg.type = type;
    msg.text = text;
    this.messages.push(msg);
    this.messages$.next(this.messages);
  }
}
