import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';
import { MessagesService } from './messages.service';

@Injectable({
  providedIn: 'root'
})
export class IpcRendererService {
  private _ipc: IpcRenderer | undefined;

  constructor(private _msg: MessagesService) {
    // TODO: fix typings properly??
    const w: any = window;
    if (w.ipcRenderer) {
      try {
        this._ipc = w.ipcRenderer;
      } catch (e) {
        throw e;
      }
    } else {
      this._msg.critical('Sorry, a fatal error has occurred. Please restart the app');
      console.error('Electron\'s IPC was not loaded');
    }
  }

  public on(channel: string, listener: any): void {
    if (!this._ipc) {
      return;
    }
    this._ipc.on(channel, listener);
  }

  public send(channel: string, ...args): void {
    if (!this._ipc) {
      return;
    }
    this._ipc.send(channel, ...args);
  }
}