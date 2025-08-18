import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { MatTabsModule } from '@angular/material/tabs'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { firstValueFrom } from 'rxjs'
import { TabId } from '../../core/models/settings.model'
import { ImageGeneratorService } from '../../core/services/image-generator.service'
import { SettingsService } from '../../core/services/settings.service'
import { LanguageSwitcherComponent } from '../../shared/language-switcher/language-switcher.component'
import { ContentTabComponent } from './content-tab/content-tab.component'

type DownloadOption = 'ALL' | 'IMG1' | 'IMG2';

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
  public aboutOpen: boolean = false;
  public downloadOption: DownloadOption = 'ALL';
  public selectedTabIndex: number = 0;

  private readonly tabs: Array<TabId> = ['NEON_BLACK', 'NEON'];

  constructor(
    public settings: SettingsService,
    private imageGen: ImageGeneratorService,
    private translate: TranslateService
  ) {}

  public ngOnInit(): void {
    const id: TabId = this.settings.activeTabId || this.tabs[0];
    this.selectedTabIndex = this.getIndexById(id);
    this.settings.setActiveTab(id);
  }

  public onTabChange(index: number): void {
    this.selectedTabIndex = index;
    this.settings.setActiveTab(this.getIdByIndex(index));
  }

  public setDownload(type: DownloadOption): void {
    this.downloadOption = type;
  }

  public async download(): Promise<void> {
    const tabId = this.settings.activeTabId;
    const s = this.settings.getFor(tabId);
    const indices = this.getSelectedIndices();

    for (const i of indices) {
      const canvas = await this.imageGen.generate(tabId, s, i);
      await this.triggerDownload(canvas, this.getFilename(s, i));
    }
  }

  public async share(): Promise<void> {
    if (!navigator.canShare)
      return alert(
        await firstValueFrom(this.translate.get('ERRORS.SHARE_NOT_SUPPORTED'))
      );

    const tabId = this.settings.activeTabId;
    const s = this.settings.getFor(tabId);
    const indices = this.getSelectedIndices();

    const canvases = await Promise.all(
      indices.map((i) => this.imageGen.generate(tabId, s, i))
    );

    const filesMaybe = await Promise.all(
      canvases.map((c, idx) =>
        this.canvasToFile(c, this.getFilename(s, indices[idx]))
      )
    );

    const files = filesMaybe.filter((f): f is File => !!f);
    if (!files.length) return;

    try {
      const title = await firstValueFrom(this.translate.get('TITLE.' + tabId));

      if (navigator.canShare({ files })) {
        await navigator.share({ files, title });
        return;
      }

      if (files.length === 1 && navigator.canShare({ files: [files[0]] })) {
        await navigator.share({ files: [files[0]], title });
        return;
      }

      alert(
        await firstValueFrom(this.translate.get('ERRORS.SHARE_NOT_SUPPORTED'))
      );
    } catch {
      alert(await firstValueFrom(this.translate.get('ERRORS.SHARE_FAILED')));
    }
  }

  public isMobile(): boolean {
    return window.innerWidth < 600;
  }

  private async canvasToFile(
    canvas: HTMLCanvasElement,
    filename: string
  ): Promise<File | null> {
    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/png')
    );
    if (!blob) return null;
    return new File([blob], filename, { type: blob.type || 'image/png' });
  }

  private getSelectedIndices(): number[] {
    switch (this.downloadOption) {
      case 'IMG1':
        return [0];
      case 'IMG2':
        return [1];
      default:
        return [0, 1];
    }
  }

  private getFilename(
    s: { date: string; format: string },
    index: number
  ): string {
    const tabId = this.settings.activeTabId;
    const prefix = tabId === 'NEON' ? 'neon' : 'neon_black';
    return `${prefix}_${s.date}_${s.format}_image${index + 1}.png`;
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

  private getIndexById(id: TabId): number {
    const i = this.tabs.indexOf(id);
    return i >= 0 ? i : 0;
  }

  private getIdByIndex(index: number): TabId {
    return this.tabs[index] ?? this.tabs[0];
  }
}
