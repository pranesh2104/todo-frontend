import { Injectable } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { RouterStateSnapshot, TitleStrategy } from "@angular/router";

@Injectable({ providedIn: 'root' })
export class CustomTitleStrategy extends TitleStrategy {
  constructor(private readonly title: Title) {
    super();
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const customTitle = this.buildTitle(snapshot);
    if (customTitle) {
      this.title.setTitle(`${customTitle} | Task Tide`);
    }
    else {
      this.title.setTitle(`Task Tide`);
    }
  }
}