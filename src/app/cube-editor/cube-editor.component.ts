import { Component, OnInit, HostListener, ElementRef, ViewChild} from '@angular/core';
import { CubeEditor } from './cube-editor';

@Component({
  selector: 'app-cube-editor',
  templateUrl: './cube-editor.component.html',
  styleUrls: ['./cube-editor.component.css']
})
export class CubeEditorComponent implements OnInit {

  @ViewChild('cube_editor') canvas: ElementRef;

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.cube_editor.handleMouseMove(event);
  }

  @HostListener('document:mousedown', ['$event'])
  onMouseClickDown(event: MouseEvent) {
    this.cube_editor.handleMouse(event, true);
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseClickUp(event: MouseEvent) {
    this.cube_editor.handleMouse(event, false);
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    this.cube_editor.handleKeyboard(event, true);
  }

  @HostListener('document:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    this.cube_editor.handleKeyboard(event, false);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.cube_editor.handleResize(event);
  }

  public cube_editor: CubeEditor;

  mode: number = 0;

  highlighted: object = null;

  selected: number = -1;

  ngOnInit() {
    this.cube_editor = new CubeEditor(this.canvas.nativeElement);
    this.cube_editor.registerModeChangeHook(() => {
      switch(this.cube_editor.getMode()){
        case "view": {
          this.mode = 0;
          break;
        }
        case "edit": {
          this.mode = 1;
          break;
        }
        case "clear": {
          this.mode = 2;
        }
      }
    });
    this.cube_editor.registerHighlightedChangeHook(() => {
      this.highlighted = this.cube_editor.getHighlighted();
    })
    this.cube_editor.registerSelectedHook(() => {
      this.selected = this.cube_editor.getSelected();
    })
  }

}
