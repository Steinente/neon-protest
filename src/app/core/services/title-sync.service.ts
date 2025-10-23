import { Injectable } from '@angular/core'
import { Title } from '@angular/platform-browser'
import { TranslateService } from '@ngx-translate/core'
import { firstValueFrom, Subscription } from 'rxjs'
import { SettingsService } from './settings.service'

@Injectable({ providedIn: 'root' })
export class TitleSyncService {
  private sub?: Subscription;
  private langSub?: Subscription;

  constructor(
    private title: Title,
    private translate: TranslateService,
    private settings: SettingsService
  ) {
    this.update();
    this.sub = this.settings.subscribe(() => this.update());
    this.langSub = this.translate.onLangChange.subscribe(() => this.update());
  }

  private async update(): Promise<void> {
    const tabId = this.settings.activeTabId;
    const base = await firstValueFrom(this.translate.get(`TITLE.${tabId}`));
    this.title.setTitle(base);
  }
}
