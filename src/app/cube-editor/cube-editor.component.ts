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

  @HostListener('document:mouseclick', ['$event'])
  onMouseClick(event: MouseEvent) {
    this.cube_editor.handleMouseClick(event);
  }

  @HostListener('document:keypress', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    // this.cube_editor_service.handleKeyboard(event);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.cube_editor.handleResize(event);
  }

  public cube_editor: CubeEditor;

  ngOnInit() {
    this.cube_editor = new CubeEditor(this.canvas.nativeElement);
  }

  expandCube(){
    this.cube_editor.expandCube();
  }

  contractCube(){
    this.cube_editor.contractCube();
  }

}
