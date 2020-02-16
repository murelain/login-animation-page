import { Component } from '@angular/core';
import { IconRegistryService } from './services/icons';

@Component({
  selector: 'edu-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'mobile-test';

  constructor(private iconRegistry: IconRegistryService) {}
}
