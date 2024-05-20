import {Routes} from '@angular/router';
import {LoginComponent} from "./components/login/login.component";
import {ChatComponent} from './components/chat/chat.component';
import {AuthGuard} from "./guards/auth.guard";

export const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: '', redirectTo: 'chat', pathMatch: 'full'},
  {path: 'chat', component: ChatComponent, canActivate: [AuthGuard]}
];
