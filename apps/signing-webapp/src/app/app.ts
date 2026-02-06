import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';

@Component({
  imports: [CommonModule, RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly titleService = inject(Title);

  readonly title = 'C2PA MCNL - Signeer tool';

  ngOnInit() {
    this.titleService.setTitle(this.title);
  }
}
