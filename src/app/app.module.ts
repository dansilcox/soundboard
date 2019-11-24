import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { SoundboardDisplayComponent } from './soundboard-display/soundboard-display.component';
import { ConfigComponent } from './config/config.component';
import { SoundsService } from './services/sounds.service';
import { CanActivateConfigGuard } from './guards/can-activate-config.guard';
import { AddComponent } from './config/add/add.component';
import { LoginService } from './services/login.service';
import { MessagesService } from './services/messages.service';
import { EditComponent } from './config/edit/edit.component';
import { AddEditFormComponent } from './config/add-edit-form/add-edit-form.component';
import { IpcRendererService } from './services/ipc-renderer.service';
import { NgDragDropModule } from 'ng-drag-drop';

@NgModule({
  declarations: [
    AppComponent,
    SoundboardDisplayComponent,
    ConfigComponent,
    AddComponent,
    EditComponent,
    AddEditFormComponent
  ],
  imports: [
    BrowserModule,
    NgDragDropModule.forRoot(),
    FormsModule,
    AppRoutingModule
  ],
  providers: [
    SoundsService,
    IpcRendererService,
    LoginService,
    MessagesService,
    CanActivateConfigGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
