// language-switcher.component.ts
import { CommonModule } from '@angular/common'
import { Component, OnDestroy, OnInit } from '@angular/core'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { Subscription } from 'rxjs'
import { DateLocaleService } from '../../core/services/date-locale.service'
import { SettingsService } from '../../core/services/settings.service'

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, MatButtonToggleModule, TranslateModule],
  templateUrl: './language-switcher.component.html',
  styleUrl: './language-switcher.component.scss',
})
export class LanguageSwitcherComponent implements OnInit, OnDestroy {
  public lang: 'de' | 'en' | 'fr' = 'de';
  private sub?: Subscription;

  constructor(
    private translate: TranslateService,
    private settings: SettingsService,
    private dateLocaleService: DateLocaleService
  ) {}

  public ngOnInit(): void {
    this.lang = this.settings.lang;
    this.translate.use(this.lang);
    this.dateLocaleService.setLocale(this.lang);

    this.sub = this.settings.subscribe((s) => {
      if (s.lang !== this.lang) {
        this.lang = s.lang;
        this.translate.use(s.lang);
        this.dateLocaleService.setLocale(s.lang);
      }
    });
  }

  public ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  public switchLang(lang: 'de' | 'en' | 'fr'): void {
    this.settings.setLang(lang);
    this.translate.use(lang);
    this.dateLocaleService.setLocale(lang);
  }
}
