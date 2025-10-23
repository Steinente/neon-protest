export type FormatId = 'PROFILE' | 'STORY';
export type TabId = 'NEON_PROTEST' | 'PRIDE_PROTEST';
export type ElementType = 'TITLE' | 'SUBTITLE' | 'TEXT' | 'DATE' | 'PLACE' | 'ANIMAL';

export interface AppSettingsPerTab {
  format: FormatId;
  date: string;
  from: string;
  to: string;
  place: string;
  animal: string;
  elements: PositionedElement[];
}

export interface AppState {
  activeTabId: TabId;
  lang: string;
  tabs: Record<TabId, AppSettingsPerTab>;
}

export interface PositionedElement {
  type: ElementType;
  value?: string;
  x: number;
  y: number;
  scale: number;
  fontSize?: number;
}
