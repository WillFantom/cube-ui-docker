import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { CubeEditorComponent } from './cube-editor/cube-editor.component';

@NgModule({
  declarations: [
    AppComponent,
    CubeEditorComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
