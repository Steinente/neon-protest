import { Injectable } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { firstValueFrom } from 'rxjs'
import { AppSettings, PositionedElement } from '../models/settings.model'
import { AnimalService } from './animal.service'

@Injectable({ providedIn: 'root' })
export class ImageGeneratorService {
  constructor(
    private animals: AnimalService,
    private translate: TranslateService
  ) {}

  public async generate(
    settings: AppSettings,
    imageIndex: number
  ): Promise<HTMLCanvasElement> {
    const bgPath =
      settings.format === 'profile' ? 'assets/profile.jpg' : 'assets/story.jpg';
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

    const elements = await this.getTemplateElements(settings, imageIndex);

    await document.fonts.load('24px Punk');
    await document.fonts.load('24px Chainprinter');

    for (const el of elements) {
      if (el.type === 'title' && el.value) {
        ctx.font = `${el.fontSize! * h}px Punk`;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.fillText(el.value!, el.x * w, el.y * h);
      }
      if (el.type === 'subtitle' && el.value && el.fontSize) {
        ctx.font = `bold ${el.fontSize! * h}px Chainprinter`;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        this.drawJustifiedUnderlinedTextBetween(
          ctx,
          el.value!,
          leftX,
          rightX,
          el.y * h,
          el.fontSize! * h
        );
      }
      if (el.type === 'text' && el.value) {
        ctx.font = `${el.fontSize! * h}px Chainprinter`;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        this.drawMultilineText(ctx, el.value, el.x * w, el.y * h);
      }
      if (el.type === 'date') {
        ctx.font = `${el.fontSize! * h}px Chainprinter`;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        this.drawJustifiedTextBetween(ctx, el.value!, leftX, rightX, el.y * h);
      }
      if (el.type === 'place') {
        ctx.font = `${el.fontSize! * h}px Chainprinter`;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        this.drawJustifiedTextBetween(ctx, el.value!, leftX, rightX, el.y * h);
      }
      if (el.type === 'animal') {
        const animal = this.animals.getByName(settings.animal);
        if (animal) {
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
        }
      }
    }
    return canvas;
  }

  private drawJustifiedTextBetween(
    ctx: CanvasRenderingContext2D,
    text: string,
    leftX: number,
    rightX: number,
    y: number
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

    let x = leftX;

    for (let i = 0; i < letters.length; i++) {
      const letter = letters[i];
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
    fontSize: number
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
    const spacing = (totalAvailable - totalTextWidth) / gaps;

    let x = leftX;
    const positions: number[] = [];

    for (const letter of letters) {
      positions.push(x);
      ctx.fillText(letter, x, y);
      x += ctx.measureText(letter).width + spacing;
    }

    const underlineStart = positions[0];
    const lastLetter = letters[letters.length - 1];
    const lastLetterWidth = ctx.measureText(lastLetter).width;
    const underlineWidth =
      (positions.at(-1) ?? leftX) + lastLetterWidth - underlineStart;

    // -18 correction
    this.drawUnderline(ctx, underlineStart - 18, underlineWidth, y, fontSize);
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
  ) {
    const lines = text.split('\n');
    const lineHeight = 1.3 * parseInt(ctx.font);
    lines.forEach((line, i) => {
      ctx.fillText(line, x, y + i * lineHeight);
    });
  }

  private async getTemplateElements(
    settings: AppSettings,
    imageIndex: number
  ): Promise<PositionedElement[]> {
    const f = settings.format === 'profile' ? 'P' : 'S';
    const suffix = `${f}${imageIndex + 1}`;
    const elements: PositionedElement[] = [];

    const title = await firstValueFrom(this.translate.get('TITLE'));
    const subtitle = await firstValueFrom(this.translate.get('SUBTITLE'));
    const soonCity = await firstValueFrom(this.translate.get('SOON_CITY'));
    const soonProtest = await firstValueFrom(
      this.translate.get('SOON_PROTEST')
    );

    if (settings.format === 'profile') {
      if (imageIndex === 0) {
        elements.push(
          this.createTitleElement(title, 0.5, 0.24, 1, 0.18, `title${suffix}`),
          this.createSubtitleElement(
            subtitle,
            0.5,
            0.33,
            1,
            0.035,
            `subtitle${suffix}`
          ),
          this.createAnimalElement(0.5, 0.7, 0.48, `animal${suffix}`),
          this.createDateElement(0.5, 0.4, 1, 0.03, `date${suffix}`, settings),
          this.createPlaceElement(
            0.5,
            0.43,
            1,
            0.028,
            `place${suffix}`,
            settings
          )
        );
      } else {
        elements.push(
          this.createTitleElement(title, 0.5, 0.24, 1, 0.18, `title${suffix}`),
          this.createSubtitleElement(
            subtitle,
            0.5,
            0.31,
            1,
            0.03,
            `subtitle${suffix}`
          ),
          this.createAnimalElement(0.5, 0.81, 0.3, `animal${suffix}`),
          this.createTextElement(
            soonCity,
            0.5,
            0.365,
            1,
            0.028,
            `textblock${suffix}`
          )
        );
      }
    } else {
      if (imageIndex === 0) {
        elements.push(
          this.createTitleElement(title, 0.5, 0.21, 1, 0.13, `title${suffix}`),
          this.createSubtitleElement(
            subtitle,
            0.5,
            0.28,
            1,
            0.025,
            `subtitle${suffix}`
          ),
          this.createAnimalElement(0.5, 0.73, 0.4, `animal${suffix}`),
          this.createTextElement(
            soonProtest,
            0.5,
            0.34,
            1,
            0.023,
            `textblock${suffix}`
          ),
          this.createDateElement(
            0.5,
            0.47,
            1,
            0.021,
            `date${suffix}`,
            settings
          ),
          this.createPlaceElement(
            0.5,
            0.5,
            1,
            0.021,
            `place${suffix}`,
            settings
          )
        );
      } else {
        elements.push(
          this.createTitleElement(title, 0.5, 0.21, 1, 0.13, `title${suffix}`),
          this.createSubtitleElement(
            subtitle,
            0.5,
            0.28,
            1,
            0.025,
            `subtitle${suffix}`
          ),
          this.createAnimalElement(0.5, 0.78, 0.35, `animal${suffix}`),
          this.createTextElement(
            soonCity,
            0.5,
            0.34,
            1,
            0.021,
            `textblock${suffix}`
          )
        );
      }
    }

    return elements;
  }

  private getDateTimeString(settings: AppSettings): string {
    const date = new Date(settings.date);

    const parseTime = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const result = new Date(date);
      result.setHours(hours, minutes, 0, 0);
      return result;
    };

    const fromTime = parseTime(settings.from);
    const toTime = parseTime(settings.to);

    const pad = (n: number) => n.toString().padStart(2, '0');

    const formatDate = (date: Date) => {
      switch (settings.lang) {
        case 'de':
          return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date
            .getFullYear()
            .toString()
            .slice(-2)}`;
        case 'en':
        case 'fr':
        default:
          return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date
            .getFullYear()
            .toString()
            .slice(-2)}`;
      }
    };

    const formatTime = (d: Date) => {
      if (settings.lang === 'en') {
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
    scale: number,
    templateKey: string
  ): PositionedElement {
    return { type: 'animal', x, y, scale, templateKey };
  }

  private createTextElement(
    value: string,
    x: number,
    y: number,
    scale: number,
    fontSize: number,
    templateKey: string
  ): PositionedElement {
    return { type: 'text', value, x, y, scale, fontSize, templateKey };
  }

  private createTitleElement(
    value: string,
    x: number,
    y: number,
    scale: number,
    fontSize: number,
    templateKey: string
  ): PositionedElement {
    return { type: 'title', value, x, y, scale, fontSize, templateKey };
  }

  private createSubtitleElement(
    value: string,
    x: number,
    y: number,
    scale: number,
    fontSize: number,
    templateKey: string
  ): PositionedElement {
    return { type: 'subtitle', value, x, y, scale, fontSize, templateKey };
  }

  private createDateElement(
    x: number,
    y: number,
    scale: number,
    fontSize: number,
    templateKey: string,
    settings: AppSettings
  ): PositionedElement {
    return {
      type: 'date',
      value: this.getDateTimeString(settings),
      x,
      y,
      scale,
      fontSize,
      templateKey,
    };
  }

  private createPlaceElement(
    x: number,
    y: number,
    scale: number,
    fontSize: number,
    templateKey: string,
    settings: AppSettings
  ): PositionedElement {
    return {
      type: 'place',
      value: settings.place.replace(/ß/g, 'ẞ').toUpperCase(),
      x,
      y,
      scale,
      fontSize,
      templateKey,
    };
  }
}
