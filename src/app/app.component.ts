import { Component } from '@angular/core'
import { FlexLayoutModule } from '@angular/flex-layout'
import { TranslateModule } from '@ngx-translate/core'
import { TitleSyncService } from './core/services/title-sync.service'
import { EditorComponent } from './features/editor/editor.component'
import { PreviewComponent } from './features/preview/preview.component'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    FlexLayoutModule,
    EditorComponent,
    PreviewComponent,
    TranslateModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(_titleSync: TitleSyncService) {}
}
