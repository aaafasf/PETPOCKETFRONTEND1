import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule],
  // QUITAMOS ".component" de estas dos líneas:
  templateUrl: './reset-password.html', 
  styleUrls: ['./reset-password.css']
})
export class ResetPasswordComponent {}