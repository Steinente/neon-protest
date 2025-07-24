import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { MatTabsModule } from '@angular/material/tabs'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { firstValueFrom } from 'rxjs'
import { ImageGeneratorService } from '../../core/services/image-generator.service'
import { SettingsService } from '../../core/services/settings.service'
import { LanguageSwitcherComponent } from '../../shared/language-switcher/language-switcher.component'
import { ContentTabComponent } from './content-tab/content-tab.component'

type DownloadOption = 'all' | 'img1' | 'img2';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    ContentTabComponent,
    LanguageSwitcherComponent,
    TranslateModule,
  ],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss',
})
export class EditorComponent {
  aboutOpen: boolean = false;
  downloadOption: DownloadOption = 'all';

  constructor(
    public settings: SettingsService,
    private imageGen: ImageGeneratorService,
    private translate: TranslateService
  ) {}

  public setDownload(type: DownloadOption): void {
    this.downloadOption = type;
  }

  public async download(): Promise<void> {
    const s = this.settings.value;
    const indices = this.getSelectedIndices();

    for (const i of indices) {
      const canvas = await this.imageGen.generate(s, i);
      await this.triggerDownload(canvas, this.getFilename(i));
    }
  }

  public async share(): Promise<void> {
    if (!navigator.canShare)
      return alert(
        await firstValueFrom(this.translate.get('ERRORS.SHARE_NOT_SUPPORTED'))
      );

    const s = this.settings.value;
    const i = this.downloadOption === 'img2' ? 1 : 0;
    const canvas = await this.imageGen.generate(s, i);

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const file = new File([blob], this.getFilename(i), { type: blob.type });

      try {
        const title = await firstValueFrom(this.translate.get('TITLE'));
        await navigator.share({ files: [file], title });
      } catch (e) {
        alert(await firstValueFrom(this.translate.get('ERRORS.SHARE_FAILED')));
      }
    });
  }

  public isMobile(): boolean {
    return window.innerWidth < 600;
  }

  private getSelectedIndices(): number[] {
    switch (this.downloadOption) {
      case 'img1':
        return [0];
      case 'img2':
        return [1];
      case 'all':
      default:
        return [0, 1];
    }
  }

  private getFilename(index: number): string {
    const s = this.settings.value;
    return `neon_black_${s.date}_${s.format}_image${index + 1}.png`;
  }

  private async triggerDownload(
    canvas: HTMLCanvasElement,
    filename: string
  ): Promise<void> {
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve)
    );
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
}
