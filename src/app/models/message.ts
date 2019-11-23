import { MessageType } from '../enums/message-type';

export class Message {
  constructor(
    public type: MessageType,
    public text: string
  ) {}
}
