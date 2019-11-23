import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SoundboardDisplayComponent } from './soundboard-display/soundboard-display.component';
import { ConfigComponent } from './config/config.component';
import { CanActivateConfigGuard } from './guards/can-activate-config.guard';
import { AddComponent } from './config/add/add.component';
import { EditComponent } from './config/edit/edit.component';

const routes: Routes = [
  { path: 'soundboard', component: SoundboardDisplayComponent },
  {
    path: 'config',
    component: ConfigComponent,
    canActivate: [CanActivateConfigGuard]
  },
  {
    path: 'config/new',
    component: AddComponent,
    canActivate: [CanActivateConfigGuard]
  },
  {
    path: 'config/edit/:id',
    component: EditComponent,
    canActivate: [CanActivateConfigGuard]
  },
  { path: '**', 'redirectTo': '/soundboard', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
