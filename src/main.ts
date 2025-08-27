import { HttpClient, provideHttpClient } from '@angular/common/http'
import { importProvidersFrom } from '@angular/core'
import {
  MAT_DATE_LOCALE,
  provideNativeDateAdapter,
} from '@angular/material/core'
import { bootstrapApplication } from '@angular/platform-browser'
import { provideAnimations } from '@angular/platform-browser/animations'
import { TranslateLoader, TranslateModule } from '@ngx-translate/core'
import { TranslateHttpLoader } from '@ngx-translate/http-loader'
import { AppComponent } from './app/app.component'
import { HtmlLangService } from './app/core/services/html-lang.service'

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideHttpClient(),
    provideNativeDateAdapter(),
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'en',
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      })
    ),
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
  ],
})
  .then((ref) => {
    const langSvc = ref.injector.get(HtmlLangService);
    langSvc.init();
  })
  .catch((err) => console.error(err));
