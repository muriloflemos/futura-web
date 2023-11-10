import { Component, OnInit, Input } from '@angular/core';

enum ButtonColor {
  primary = 'primary',
  secondary = 'secondary',
  accent = 'accent',
  warn = 'warn',
}

enum ButtonType {
  normal = 'normal',
  icon = 'icon',
}

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css'],
  host: {
    '[attr.color]': 'color',
  }
})
export class ButtonComponent implements OnInit {
  @Input() title = '';
  @Input() icon = '';
  @Input() color: string = ButtonColor.primary;
  @Input() type: string = ButtonType.normal;
  @Input() disabled = false;

  ButtonType = ButtonType;

  constructor() {}

  ngOnInit(): void {}
}
