import { DOCUMENT } from '@angular/common'
import { Inject, Injectable } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { SettingsService } from './settings.service'

@Injectable({ providedIn: 'root' })
export class HtmlLangService {
  constructor(
    @Inject(DOCUMENT) private doc: Document,
    private translate: TranslateService,
    private settings: SettingsService
  ) {}

  init(): void {
    const initial = this.settings.lang;
    this.setHtmlAttrs(initial);

    this.translate.onLangChange.subscribe((e) => this.setHtmlAttrs(e.lang));
    this.settings.subscribe((s) => this.setHtmlAttrs(s.lang));
  }

  private setHtmlAttrs(lang: string): void {
    this.doc.documentElement.lang = lang;
    const dir = ['ar', 'he', 'fa', 'ur'].includes(lang) ? 'rtl' : 'ltr';
    this.doc.documentElement.dir = dir;
  }
}
