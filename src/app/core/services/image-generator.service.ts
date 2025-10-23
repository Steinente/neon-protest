import { Injectable } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { firstValueFrom } from 'rxjs'
import {
  AppSettingsPerTab,
  FormatId,
  PositionedElement,
  TabId,
} from '../models/settings.model'
import { AnimalService } from './animal.service'
import { SettingsService } from './settings.service'

type TextStyle = {
  font: string;
  color: string;
  weight?: 'normal' | 'bold';
};

type Theme = {
  title: TextStyle;
  subtitle: TextStyle;
  text: TextStyle;
  date: TextStyle;
  place: TextStyle;
};

const THEMES: Record<TabId, Theme> = {
  PRIDE_PROTEST: {
    title: { font: 'FeelGood', color: '#e00985', weight: 'normal' },
    subtitle: { font: 'FeelGood', color: '#131413', weight: 'normal' },
    text: { font: 'FeelGood', color: '#131413', weight: 'normal' },
    date: { font: 'FeelGood', color: '#131413', weight: 'normal' },
    place: { font: 'FeelGood', color: '#131413', weight: 'normal' },
  },
  NEON_PROTEST: {
    title: { font: 'Punk', color: '#fff', weight: 'normal' },
    subtitle: { font: 'Chainprinter', color: '#fff', weight: 'bold' },
    text: { font: 'Chainprinter', color: '#fff', weight: 'normal' },
    date: { font: 'Chainprinter', color: '#fff', weight: 'normal' },
    place: { font: 'Chainprinter', color: '#fff', weight: 'normal' },
  },
};

@Injectable({ providedIn: 'root' })
export class ImageGeneratorService {
  constructor(
    private animals: AnimalService,
    private translate: TranslateService,
    private settings: SettingsService
  ) {}

  public async generate(
    tabId: TabId,
    settingsPerTab: AppSettingsPerTab,
    imageIndex: number
  ): Promise<HTMLCanvasElement> {
    const bgPath = this.getBackgroundPath(tabId, settingsPerTab.format);
    const bgImage = await this.loadImage(bgPath);

    const w = bgImage.width;
    const h = bgImage.height;
    const padding = 0.022 * w;
    const leftX = 0.13 * w + padding;
    const rightX = 0.87 * w;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(bgImage, 0, 0);
    ctx.textAlign = 'center';

    await this.loadFontsFor(tabId);

    let elements = await this.getTemplateElements(
      tabId,
      settingsPerTab,
      imageIndex
    );

    if (tabId === 'PRIDE_PROTEST') {
      elements = elements.map((el) =>
        el.value
          ? {
              ...el,
              value: el.value.replace(/[A-Z]/g, (c) => c.toLowerCase()),
            }
          : el
      );
    }
    const theme = THEMES[tabId];

    for (const el of elements) {
      switch (el.type) {
        case 'TITLE':
          if (!el.value) break;
          this.applyTextStyle(ctx, theme.title, el.fontSize!, h);
          ctx.fillText(el.value, el.x * w, el.y * h);
          break;

        case 'SUBTITLE':
          if (!el.value || !el.fontSize) break;
          this.applyTextStyle(ctx, theme.subtitle, el.fontSize, h);
          if (tabId === 'NEON_PROTEST') {
            this.drawJustifiedUnderlinedTextBetween(
              ctx,
              el.value,
              leftX,
              rightX,
              el.y * h,
              el.fontSize * h,
              0.7,
              0.7
            );
          } else {
            this.drawJustifiedUnderlinedTextBetween(
              ctx,
              el.value,
              leftX,
              rightX,
              el.y * h,
              el.fontSize * h
            );
          }
          break;

        case 'TEXT':
          if (!el.value || !el.fontSize) break;
          this.applyTextStyle(ctx, theme.text, el.fontSize, h);
          if (tabId === 'NEON_PROTEST') {
            this.drawJustifiedMultilineTextBetween(
              ctx,
              el.value,
              leftX,
              rightX,
              el.y * h,
              el.fontSize * h,
              1
            );
          } else {
            this.drawMultilineText(ctx, el.value, el.x * w, el.y * h);
          }
          break;

        case 'DATE':
          if (!el.value || !el.fontSize) break;
          this.applyTextStyle(ctx, theme.date, el.fontSize, h);
          this.drawJustifiedTextBetween(
            ctx,
            el.value,
            leftX,
            rightX,
            el.y * h,
            false
          );
          break;

        case 'PLACE':
          if (!el.value || !el.fontSize) break;
          this.applyTextStyle(ctx, theme.place, el.fontSize, h);
          this.drawJustifiedTextBetween(
            ctx,
            el.value,
            leftX,
            rightX,
            el.y * h,
            false
          );
          break;

        case 'ANIMAL': {
          const animal = this.animals.getByName(tabId, settingsPerTab.animal);
          if (!animal) break;
          const img = await this.loadImage(animal.image);
          const aspectRatio = img.width / img.height;
          const scaledHeight = el.scale * h;
          const scaledWidth = scaledHeight * aspectRatio;
          ctx.drawImage(
            img,
            el.x * w - scaledWidth / 2,
            el.y * h - scaledHeight / 2,
            scaledWidth,
            scaledHeight
          );
          break;
        }
      }
    }

    return canvas;
  }

  private getBackgroundPath(tabId: TabId, format: FormatId): string {
    const isProfile = format === 'PROFILE';
    if (tabId === 'NEON_PROTEST') {
      return isProfile
        ? 'assets/profile_neon_protest.jpg'
        : 'assets/story_neon_protest.jpg';
    }
    return isProfile
      ? 'assets/profile_pride_protest.jpg'
      : 'assets/story_pride_protest.jpg';
  }

  private applyTextStyle(
    ctx: CanvasRenderingContext2D,
    style: TextStyle,
    fontSizeRel: number,
    h: number
  ): void {
    const px = fontSizeRel * h;
    const weight =
      style.weight && style.weight !== 'normal' ? `${style.weight} ` : '';
    ctx.font = `${weight}${px}px ${style.font}`;
    ctx.fillStyle = style.color;
  }

  private async loadFontsFor(tabId: TabId): Promise<void> {
    const t = THEMES[tabId];
    const families = new Set([
      t.title.font,
      t.subtitle.font,
      t.text.font,
      t.date.font,
      t.place.font,
    ]);
    for (const f of families) {
      await document.fonts.load(`24px ${f}`);
    }
  }

  private drawJustifiedTextBetween(
    ctx: CanvasRenderingContext2D,
    text: string,
    leftX: number,
    rightX: number,
    y: number,
    isTitle: boolean
  ): void {
    if (!text || text.length < 2) {
      ctx.textAlign = 'left';
      ctx.fillText(text, leftX, y);
      return;
    }
    const letters = text.split('');
    const totalTextWidth = ctx.measureText(text).width;
    const gaps = letters.length - 1;
    const totalAvailable = rightX - leftX;
    const spacing = (totalAvailable - totalTextWidth) / gaps;

    let x = leftX + (isTitle ? 85 : 0);
    for (const letter of letters) {
      ctx.fillText(letter, x, y);
      x += ctx.measureText(letter).width + spacing;
    }
  }

  private drawJustifiedUnderlinedTextBetween(
    ctx: CanvasRenderingContext2D,
    text: string,
    leftX: number,
    rightX: number,
    y: number,
    fontSize: number,
    iBiasRatio: number = 0,
    iFirstRightExtraRatio: number = 0
  ): void {
    if (!text || text.length < 2) {
      ctx.textAlign = 'left';
      ctx.fillText(text, leftX, y);
      this.drawUnderline(ctx, leftX, ctx.measureText(text).width, y, fontSize);
      return;
    }

    const letters = text.split('');
    const totalTextWidth = ctx.measureText(text).width;
    const gaps = letters.length - 1;
    const totalAvailable = rightX - leftX;
    const totalSpacing = totalAvailable - totalTextWidth;

    const weights = new Array(gaps).fill(1);
    const r = Math.max(-0.9, Math.min(0.9, iBiasRatio));
    const isI = (ch: string) => ch.toLowerCase() === 'i';

    if (r !== 0) {
      for (let j = 0; j < gaps; j++) {
        const leftChar = letters[j];
        const rightChar = letters[j + 1];
        if (isI(rightChar)) weights[j] *= 1 - r;
        else if (isI(leftChar)) weights[j] *= 1 + r;
      }
    }

    if (
      letters[0] &&
      isI(letters[0]) &&
      iFirstRightExtraRatio !== 0 &&
      gaps > 0
    ) {
      weights[0] *= 1 + iFirstRightExtraRatio;
    }

    const sumW = weights.reduce((a, b) => a + b, 0);
    const unit = sumW > 0 ? totalSpacing / sumW : 0;
    const gapWidths = weights.map((w) => w * unit);

    let x = leftX;
    const positions: number[] = [];
    for (let k = 0; k < letters.length; k++) {
      const ch = letters[k];
      positions.push(x);
      ctx.fillText(ch, x, y);
      x += ctx.measureText(ch).width;
      if (k < gaps) x += gapWidths[k];
    }

    const underlineStart = positions[0];
    const lastLetter = letters[letters.length - 1];
    const lastLetterWidth = ctx.measureText(lastLetter).width;
    const underlineWidth =
      (positions.at(-1) ?? leftX) + lastLetterWidth - underlineStart;

    this.drawUnderline(ctx, underlineStart - 18, underlineWidth, y, fontSize);
  }

  private drawJustifiedMultilineTextBetween(
    ctx: CanvasRenderingContext2D,
    text: string,
    leftX: number,
    rightX: number,
    startY: number,
    fontPx: number,
    lineHeightFactor: number = 1.3,
    shortLetterSpacingRatio: number = 0.08
  ): void {
    const prevAlign: CanvasTextAlign = ctx.textAlign as CanvasTextAlign;
    ctx.textAlign = 'left';

    const centerX = (leftX + rightX) / 2;
    const shortThreshold = 19;

    const lines = text.split('\n');
    let y = startY;

    for (const line of lines) {
      const len = line.length;

      if (len === 0) {
        y += fontPx * lineHeightFactor;
        continue;
      }

      if (len < shortThreshold) {
        const letters = Array.from(line);
        const tracking = Math.max(1, fontPx * shortLetterSpacingRatio);
        const charsWidth = letters.reduce(
          (sum, ch) => sum + ctx.measureText(ch).width,
          0
        );
        const totalWidth = charsWidth + tracking * (letters.length - 1);
        let x = centerX - totalWidth / 2;
        for (const ch of letters) {
          ctx.fillText(ch, x, y);
          x += ctx.measureText(ch).width + tracking;
        }
      } else {
        const gaps = len - 1;
        if (gaps <= 0) {
          ctx.fillText(line, leftX, y);
        } else {
          const totalTextWidth = ctx.measureText(line).width;
          const totalAvailable = rightX - leftX;
          const spacing = (totalAvailable - totalTextWidth) / gaps;
          let x = leftX - 15;
          for (const ch of line) {
            ctx.fillText(ch, x, y);
            x += ctx.measureText(ch).width + spacing;
          }
        }
      }

      y += fontPx * lineHeightFactor;
    }

    ctx.textAlign = prevAlign;
  }

  private drawUnderline(
    ctx: CanvasRenderingContext2D,
    startX: number,
    width: number,
    y: number,
    fontSize: number
  ): void {
    const underlineY = y + fontSize * 0.2;
    ctx.beginPath();
    ctx.moveTo(startX, underlineY);
    ctx.lineTo(startX + width, underlineY);
    ctx.lineWidth = Math.max(1, fontSize * 0.05);
    ctx.strokeStyle = ctx.fillStyle as string;
    ctx.stroke();
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  private drawMultilineText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number
  ): void {
    const lines = text.split('\n');
    const lineHeight = 1.3 * parseInt(ctx.font);
    lines.forEach((line, i) => {
      ctx.fillText(line, x, y + i * lineHeight);
    });
  }

  private async getTemplateElements(
    tabId: TabId,
    settingsPerTab: AppSettingsPerTab,
    imageIndex: number
  ): Promise<PositionedElement[]> {
    const elements: PositionedElement[] = [];

    const title = await firstValueFrom(this.translate.get(`TITLE.${tabId}`));
    const subtitle = await firstValueFrom(this.translate.get('SUBTITLE'));
    const soonCity = await firstValueFrom(
      this.translate.get(`SOON_CITY.${tabId}`)
    );
    const soonProtest = await firstValueFrom(
      this.translate.get(`SOON_PROTEST.${tabId}`)
    );

    if (tabId === 'NEON_PROTEST') {
      if (settingsPerTab.format === 'PROFILE') {
        if (imageIndex === 0) {
          elements.push(
            this.createTitleElement(title, 0.5, 0.25, 1, 0.15),
            this.createSubtitleElement(subtitle, 0.5, 0.35, 1, 0.044),
            this.createAnimalElement(0.5, 0.7, 0.4),
            this.createDateElement(0.5, 0.42, 1, 0.033, settingsPerTab),
            this.createPlaceElement(0.5, 0.455, 1, 0.033, settingsPerTab)
          );
        } else {
          elements.push(
            this.createTitleElement(title, 0.5, 0.25, 1, 0.15),
            this.createSubtitleElement(subtitle, 0.5, 0.35, 1, 0.044),
            this.createAnimalElement(0.5, 0.81, 0.3),
            this.createTextElement(soonCity, 0.5, 0.41, 1, 0.033)
          );
        }
      } else {
        if (imageIndex === 0) {
          elements.push(
            this.createTitleElement(title, 0.5, 0.21, 1, 0.105),
            this.createSubtitleElement(subtitle, 0.5, 0.28, 1, 0.03),
            this.createAnimalElement(0.5, 0.72, 0.44),
            this.createTextElement(soonProtest, 0.5, 0.34, 1, 0.025),
            this.createDateElement(0.5, 0.42, 1, 0.025, settingsPerTab),
            this.createPlaceElement(0.5, 0.45, 1, 0.025, settingsPerTab)
          );
        } else {
          elements.push(
            this.createTitleElement(title, 0.5, 0.21, 1, 0.105),
            this.createSubtitleElement(subtitle, 0.5, 0.28, 1, 0.03),
            this.createAnimalElement(0.5, 0.75, 0.38),
            this.createTextElement(soonCity, 0.5, 0.34, 1, 0.025)
          );
        }
      }
    } else {
      if (settingsPerTab.format === 'PROFILE') {
        if (imageIndex === 0) {
          elements.push(
            this.createTitleElement(title, 0.5, 0.24, 1, 0.096),
            this.createSubtitleElement(subtitle, 0.5, 0.30, 1, 0.035),
            this.createAnimalElement(0.5, 0.7, 0.48),
            this.createDateElement(0.5, 0.4, 1, 0.03, settingsPerTab),
            this.createPlaceElement(0.5, 0.43, 1, 0.028, settingsPerTab)
          );
        } else {
          elements.push(
            this.createTitleElement(title, 0.5, 0.24, 1, 0.096),
            this.createSubtitleElement(subtitle, 0.5, 0.30, 1, 0.035),
            this.createAnimalElement(0.5, 0.81, 0.3),
            this.createTextElement(soonCity, 0.5, 0.365, 1, 0.028)
          );
        }
      } else {
        if (imageIndex === 0) {
          elements.push(
            this.createTitleElement(title, 0.5, 0.2, 1, 0.068),
            this.createSubtitleElement(subtitle, 0.5, 0.25, 1, 0.025),
            this.createAnimalElement(0.5, 0.73, 0.4),
            this.createTextElement(soonProtest, 0.5, 0.34, 1, 0.023),
            this.createDateElement(0.5, 0.47, 1, 0.021, settingsPerTab),
            this.createPlaceElement(0.5, 0.5, 1, 0.021, settingsPerTab)
          );
        } else {
          elements.push(
            this.createTitleElement(title, 0.5, 0.2, 1, 0.068),
            this.createSubtitleElement(subtitle, 0.5, 0.25, 1, 0.025),
            this.createAnimalElement(0.5, 0.76, 0.35),
            this.createTextElement(soonCity, 0.5, 0.33, 1, 0.021)
          );
        }
      }
    }

    return elements;
  }

  private getDateTimeString(settingsPerTab: AppSettingsPerTab): string {
    const lang = this.settings.lang || 'en';
    const date = new Date(settingsPerTab.date);

    const parseTime = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const result = new Date(date);
      result.setHours(hours, minutes, 0, 0);
      return result;
    };

    const fromTime = parseTime(settingsPerTab.from);
    const toTime = parseTime(settingsPerTab.to);

    const pad = (n: number) => n.toString().padStart(2, '0');

    const formatDate = (d: Date) => {
      switch (lang) {
        case 'de':
        case 'is':
        case 'pl':
          return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d
            .getFullYear()
            .toString()
            .slice(-2)}`;
        case 'hu':
          return `${d.getFullYear()}. ${pad(d.getMonth() + 1)}. ${pad(
            d.getDate()
          )}.`;
        case 'fr':
        case 'en':
        default:
          return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d
            .getFullYear()
            .toString()
            .slice(-2)}`;
      }
    };

    const formatTime = (d: Date) => {
      if (lang === 'en') {
        let hours = d.getHours();
        const minutes = pad(d.getMinutes());
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        if (hours === 0) hours = 12;
        return `${hours}:${minutes} ${ampm}`;
      }
      return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const formattedDate = formatDate(date);
    const formattedFrom = formatTime(fromTime);
    const formattedTo = formatTime(toTime);

    return `${formattedDate} | ${formattedFrom} - ${formattedTo}`;
  }

  private createAnimalElement(
    x: number,
    y: number,
    scale: number
  ): PositionedElement {
    return { type: 'ANIMAL', x, y, scale };
  }

  private createTextElement(
    value: string,
    x: number,
    y: number,
    scale: number,
    fontSize: number
  ): PositionedElement {
    return { type: 'TEXT', value, x, y, scale, fontSize };
  }

  private createTitleElement(
    value: string,
    x: number,
    y: number,
    scale: number,
    fontSize: number
  ): PositionedElement {
    return { type: 'TITLE', value, x, y, scale, fontSize };
  }

  private createSubtitleElement(
    value: string,
    x: number,
    y: number,
    scale: number,
    fontSize: number
  ): PositionedElement {
    return { type: 'SUBTITLE', value, x, y, scale, fontSize };
  }

  private createDateElement(
    x: number,
    y: number,
    scale: number,
    fontSize: number,
    settingsPerTab: AppSettingsPerTab
  ): PositionedElement {
    return {
      type: 'DATE',
      value: this.getDateTimeString(settingsPerTab),
      x,
      y,
      scale,
      fontSize,
    };
  }

  private createPlaceElement(
    x: number,
    y: number,
    scale: number,
    fontSize: number,
    settingsPerTab: AppSettingsPerTab
  ): PositionedElement {
    return {
      type: 'PLACE',
      value: settingsPerTab.place,
      x,
      y,
      scale,
      fontSize,
    };
  }
}
