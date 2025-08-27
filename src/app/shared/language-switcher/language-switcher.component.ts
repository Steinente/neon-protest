import { CommonModule } from '@angular/common'
import { Component, OnDestroy, OnInit } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatListModule } from '@angular/material/list'
import { MatMenuModule } from '@angular/material/menu'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { Subscription } from 'rxjs'
import { DateLocaleService } from '../../core/services/date-locale.service'
import { SettingsService } from '../../core/services/settings.service'

type LangCode = string;

interface LangItem {
  code: LangCode;
  name: string;
  flag: string;
}

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatMenuModule,
    MatListModule,
    TranslateModule,
  ],
  templateUrl: './language-switcher.component.html',
  styleUrl: './language-switcher.component.scss',
})
export class LanguageSwitcherComponent implements OnInit, OnDestroy {
  public lang: LangCode = 'en';
  private sub?: Subscription;

  public languages: LangItem[] = [
    { code: 'de', name: 'Deutsch', flag: 'de' },
    { code: 'en', name: 'English', flag: 'gb' },
    { code: 'fr', name: 'Français', flag: 'fr' },
    { code: 'is', name: 'Íslenska', flag: 'is' },
  ];

  constructor(
    private translate: TranslateService,
    private settings: SettingsService,
    private dateLocaleService: DateLocaleService
  ) {}

  public get langs(): LangItem[] {
    return [...this.languages].sort((a, b) => a.name.localeCompare(b.name));
  }

  public get currentFlag(): string {
    const cur = this.languages.find((l) => l.code === this.lang);
    return cur?.flag ?? 'un';
  }

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

  public switchLang(lang: LangCode): void {
    this.settings.setLang(lang);
    this.translate.use(lang);
    this.dateLocaleService.setLocale(lang);
  }
}
