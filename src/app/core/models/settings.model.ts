export interface AppSettings {
  format: 'profile' | 'story';
  date: string;
  from: string;
  to: string;
  place: string;
  animal: string;
  lang: string;
  elements: PositionedElement[];
}

export interface PositionedElement {
  type: 'title' | 'subtitle' | 'text' | 'date' | 'place' | 'animal';
  value?: string;
  x: number;
  y: number;
  scale: number;
  fontSize?: number;
  templateKey?: string;
}
