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
  public lang: string = 'de';
  private sub?: Subscription;

  constructor(
    private translate: TranslateService,
    private settings: SettingsService,
    private dateLocaleService: DateLocaleService
  ) {}

  public ngOnInit(): void {
    this.lang = this.settings.value.lang;
    this.translate.use(this.lang);

    this.sub = this.settings.subscribe((s) => {
      if (s.lang !== this.lang) {
        this.lang = s.lang;
        this.translate.use(s.lang);
      }
    });
  }

  public ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  public switchLang(lang: string): void {
    this.settings.update({ lang });
    this.dateLocaleService.setLocale(lang);
  }
}
