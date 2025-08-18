import { CommonModule } from '@angular/common'
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { ImageGeneratorService } from '../../core/services/image-generator.service'
import { SettingsService } from '../../core/services/settings.service'

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './preview.component.html',
  styleUrl: './preview.component.scss',
})
export class PreviewComponent implements AfterViewInit {
  @ViewChild('canvas1') private canvas1Ref!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvas2') private canvas2Ref!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasAll1')
  private canvasAll1Ref!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasAll2')
  private canvasAll2Ref!: ElementRef<HTMLCanvasElement>;

  public showAll: boolean = false;
  public current: number = 0;

  private previousCurrent: number | null = null;
  private wasAllRendered: boolean = false;

  constructor(
    private imageGen: ImageGeneratorService,
    public settingsService: SettingsService,
    private cdr: ChangeDetectorRef
  ) {}

  public ngAfterViewInit(): void {
    this.settingsService.subscribe(() => {
      this.showAll ? this.renderAll() : this.renderCurrent();
    });
    this.renderCurrent();
  }

  public ngAfterViewChecked(): void {
    if (this.showAll !== this.wasAllRendered) {
      this.wasAllRendered = this.showAll;
      this.showAll ? this.renderAll() : this.renderCurrent();
    }
  }

  public openAll(): void {
    this.previousCurrent = this.current;
    this.showAll = true;
  }

  public closeAll(): void {
    this.showAll = false;
    if (this.previousCurrent !== null) {
      this.current = this.previousCurrent;
      this.previousCurrent = null;
    }
  }

  public set currentIndex(n: number) {
    this.current = n;
    this.showAll = false;
    this.cdr.detectChanges();
    setTimeout(() => this.renderCurrent(), 0);
  }

  public get canvasFormatClass(): string {
    const tabId = this.settingsService.activeTabId;
    return this.settingsService.getFor(tabId).format;
  }

  private async renderCurrent(): Promise<void> {
    const canvas = this.getCanvasRef(this.current);
    if (!canvas) return;

    const tabId = this.settingsService.activeTabId;
    const s = this.settingsService.getFor(tabId);
    const offscreen = await this.imageGen.generate(tabId, s, this.current);

    this.copyCanvas(offscreen, canvas);
    this.applyAspectRatio(canvas);
  }

  private getCanvasRef(index: number): HTMLCanvasElement | null {
    return index === 0
      ? this.canvas1Ref?.nativeElement ?? null
      : this.canvas2Ref?.nativeElement ?? null;
  }

  private async renderAll(): Promise<void> {
    const tabId = this.settingsService.activeTabId;
    const s = this.settingsService.getFor(tabId);

    const [c1, c2] = await Promise.all([
      this.imageGen.generate(tabId, s, 0),
      this.imageGen.generate(tabId, s, 1),
    ]);

    const canvas1 = this.canvasAll1Ref?.nativeElement;
    const canvas2 = this.canvasAll2Ref?.nativeElement;

    if (canvas1 && canvas2) {
      this.copyCanvas(c1, canvas1);
      this.copyCanvas(c2, canvas2);
      this.applyAspectRatio(canvas1);
      this.applyAspectRatio(canvas2);
    }
  }

  private copyCanvas(src: HTMLCanvasElement, dest: HTMLCanvasElement): void {
    dest.width = src.width;
    dest.height = src.height;
    const ctx = dest.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, dest.width, dest.height);
      ctx.drawImage(src, 0, 0);
    }
  }

  private applyAspectRatio(canvas: HTMLCanvasElement): void {
    const tabId = this.settingsService.activeTabId;
    const format = this.settingsService.getFor(tabId).format;
    const ratioMap: Record<string, string> = {
      story: '9 / 16',
      profile: '4 / 5',
    };
    canvas.style.aspectRatio = ratioMap[format] || '';
  }
}
