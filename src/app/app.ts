import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet], 
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'PetPocket';
  private _sub?: Subscription;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Apply dark mode class automatically for admin routes
    // Initialize theme from localStorage so user preference persists
    const saved = localStorage.getItem('petpocket-theme');
    if (saved === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }

  ngOnDestroy(): void {
    // nothing to cleanup
  }
}