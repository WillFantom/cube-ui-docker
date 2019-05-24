import * as THREE from 'three-full';
import { Cube } from './cube';
import { Led } from './led';

export class CubeEditor {
  // renderer for the cube
  private renderer: THREE.WebGLRenderer;

  // animation scene
  private scene: THREE.Scene;

  // point light for shadows
  private pointLight: THREE.PointLight;

  // ambient light
  private ambientLight: THREE.AmbientLight;

  // animation perspective camera
  private camera: THREE.PerspectiveCamera;

  // pan/zoom controls
  private controls: THREE.OrbitControls;

  // raycaster for mouse input detection
  private raycaster: THREE.Raycaster;

  private axesHelper: THREE.AxesHelper;

  // editor options
  private options: {
    initCubeSize: number,
    cubeDimensions: number,
    initCubeSpacing: number,
    maxCubeSpacing: number,
    backgroundColor: number,
    axesHelper: boolean,
    initLedColor: number,
    initLedOpacity: number,
    initLedHighlightColor: number,
    initLedSelectColor: number,
    initLedOnColor: number,
    initLedOnOpacity: number,
    devicePixelRatio: number,
    widthPercentage: number,
    heightPercentage: number
  };

  // editor state
  private state: {
    mouse: THREE.Vector2,
    currentIntersect: any,
    previousIntersect: any,
    currentIntersecteeMeshes: any[],
    domElement: any,
    currentCube: Cube,
    mode: string,
    onModeChangeHook: Function,
    highlighted: {
      mode: string,
      index: number
    },
    onHighlightedChangeHook: Function,
    selected: number,
    onSelectedHook: Function,
    multidraw: boolean,
    clickedIn: boolean,
    copiedRow: any[],
    copiedCol: any[]
  };

  constructor(domElement: any, options: Partial<Object> = {}){
    // prep options
    this.options = Object.assign({
      initCubeSize: 3,
      cubeDimensions: 8,
      initCubeSpacing: 0.5,
      maxCubeSpacing: 5,
      backgroundColor: 0x252525,
      axesHelper: true,
      initLedColor: 0xffffff,
      initLedOpacity: 0.15,
      initLedHighlightColor: 0x0CBCDC,
      initLedSelectColor: 0x0000ff,
      initLedOnColor: 0xffffff,
      initLedOnOpacity: 1.0,
      devicePixelRatio: window.devicePixelRatio,
      widthPercentage: 100,
      heightPercentage: 100
    }, options);

    this.state = {
      mouse: null,
      currentIntersect: null,
      previousIntersect: null,
      currentIntersecteeMeshes: [],
      domElement: domElement,
      currentCube: null,
      mode: "view",
      onModeChangeHook: null,
      highlighted: {
        mode: "none",
        index: -1
      },
      onHighlightedChangeHook: null,
      selected: -1,
      onSelectedHook: null,
      multidraw: false,
      clickedIn: false,
      copiedRow: null,
      copiedCol: null
    };

    this.initSize();
    this.initRenderer();
    this.initScene();
    this.initLights();
    this.initAxesHelper();
    this.initCamera();
    this.initControls();
    this.initRaycaster();

    var initCube = new Cube(
      this.options.cubeDimensions,
      this.options.initCubeSize,
      this.options.initCubeSpacing,
      this.options.initLedColor,
      this.options.initLedOpacity
    );

    initCube.addTo(this.scene);

    this.state.currentCube = initCube;

    this.animate();
  }

  private animate(){
    requestAnimationFrame(() => {
      this.animate();
    })
    this.update();
    this.renderer.render(this.scene, this.camera);
  }

  private update(){
    this.controls.update();
    this.pointLight.position.copy( this.camera.position );
    this.camera.updateMatrixWorld();
    this.intersect();
  }


  private getWidth(){
    return this.state.domElement.width;
  }

  private getHeight(){
    return this.state.domElement.height;
  }

  private initSize(){
    this.state.domElement.width = (this.options.widthPercentage / 100) * window.innerWidth;
    this.state.domElement.height = (this.options.heightPercentage / 100) * window.innerHeight;
  }

  private initRenderer(){
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.state.domElement,
      alpha: true,
      antialias: true
    });

    this.renderer.setSize(this.getWidth(), this.getHeight());
    this.renderer.setPixelRatio( this.options.devicePixelRatio );
  }

  private initScene(){
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( this.options.backgroundColor );
  }

  private initLights(){
    this.pointLight = new THREE.PointLight(0xffffff, 1);
    this.pointLight.position.set(0, 300, 200);
    this.scene.add(this.pointLight);
    this.ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(this.ambientLight);
  }

  public initControls(){
    this.controls = new THREE.OrbitControls(this.camera, this.state.domElement);
    this.controls.enablePan = false;
    this.controls.enableKeys = false;
  }

  private initCamera(){
    this.camera = new THREE.PerspectiveCamera(45, this.getWidth() / this.getHeight(), 0.1, 10000);
    this.camera.position.x = 10;
    this.camera.position.y = 10;
    this.camera.position.z = 100;
    this.scene.add(this.camera);
  }

  private initAxesHelper(){
    this.axesHelper = new THREE.AxesHelper( 50 );
    this.scene.add( this.axesHelper );
  }

  private initRaycaster(){
    this.raycaster = new THREE.Raycaster();
  }

  private intersect(){
    if(this.state.mouse && this.state.mode === "edit" && this.state.highlighted.mode !== "none" && this.state.selected !== -1){
      this.raycaster.setFromCamera( this.state.mouse, this.camera );
      var intersects = this.raycaster.intersectObjects(this.state.currentIntersecteeMeshes);
      if(intersects.length > 0){
        if(this.state.currentIntersect != intersects[0].object){
          if(this.state.currentIntersect){
            this.state.currentIntersect.material.color.setHex(this.state.currentIntersect.userData.currentHex);
          }
          this.state.previousIntersect = this.state.currentIntersect;
          this.state.currentIntersect = intersects[0].object;
          this.state.currentIntersect.userData.currentHex = this.state.currentIntersect.material.color.getHex();

          if(this.state.currentIntersect.userData.led.state){
            this.state.currentIntersect.material.color.setHex(0xff0000);
          } else {
            this.state.currentIntersect.material.color.setHex(0x00ff00);
          }
        }
      } else {
        if(this.state.currentIntersect){
          this.state.currentIntersect.material.color.setHex(this.state.currentIntersect.userData.currentHex);
        }
        this.state.currentIntersect = null;
      }
    }
  }

  private copyRowCol(){
    if(this.state.mode === "edit" && this.state.highlighted.mode !== "none"){
      if(this.state.highlighted.mode === "row"){
        this.state.copiedRow = this.state.currentCube.getRow(this.state.highlighted.index);
      } else if(this.state.highlighted.mode === "col"){
        this.state.copiedCol = this.state.currentCube.getCol(this.state.highlighted.index);
      }
    }
  }

  private pasteRowCol(){
    if(this.state.mode === "edit" && this.state.highlighted.mode !== "none"){
      if(this.state.highlighted.mode === "row" && this.state.copiedRow){
        var newRow = this.state.currentCube.getRow(this.state.highlighted.index);
        for(var i = 0; i < this.state.copiedRow.length; i++){
          var pLed = this.state.copiedRow[i];
          var nLed = newRow[i];
          if(pLed.state){
            this.ledOn(nLed);
          } else {
            this.ledOff(nLed);
          }
        }
      } else if(this.state.highlighted.mode === "col" && this.state.copiedCol){
        var newCol = this.state.currentCube.getCol(this.state.highlighted.index);
        for(var i = 0; i < this.state.copiedCol.length; i++){
          var pLed = this.state.copiedCol[i];
          var nLed = newCol[i];
          if(pLed.state){
            this.ledOn(nLed);
          } else {
            this.ledOff(nLed);
          }
        }
      }
    }
  }

  private handleMouseClick(updown: boolean){
    if(this.state.mode === "edit" && this.state.highlighted.mode !== "none" && this.state.selected !== -1 && this.state.currentIntersect){
      if(updown){
        this.controls.enabled = false;
        var led = this.state.currentIntersect.userData.led;
        if(led.state){
          this.ledOff(led);
        } else {
          this.ledOn(led);
        }
      } else {
        this.controls.enabled = true;
      }
    }
  }

  private ledOn(led: Led){
    led.color = this.options.initLedOnColor;
    led.opacity = this.options.initLedOnOpacity;
    led.state = true;
  }

  private ledOff(led: Led){
    led.color = this.options.initLedColor;
    led.opacity = this.options.initLedOpacity;
    led.state = false;
  }

  private handleDeselect(){
    this.state.selected = -1;
    this.state.currentIntersecteeMeshes = [];
    if(this.state.highlighted.mode === "row"){
      for(var i = 0; i < this.options.cubeDimensions; i++){
        this.showRow(i);
      }
    } else if(this.state.highlighted.mode === "col"){
      for(var i = 0; i < this.options.cubeDimensions; i++){
        this.showCol(i);
      }
    }
    this.state.onSelectedHook();
  }

  private handleSelect(){
    this.state.currentIntersecteeMeshes = [];
    this.state.selected = this.state.highlighted.index;
    if(this.state.highlighted.mode === "row"){
      for(var i = 0; i < this.options.cubeDimensions; i++){
        if(i !== this.state.selected){
          this.hideRow(i);
        } else {
          this.state.currentCube.getRow(i).forEach((led) => {
            this.state.currentIntersecteeMeshes.push(led.mesh);
          });
        }
      }

    } else if(this.state.highlighted.mode === "col"){
      for(var i = 0; i < this.options.cubeDimensions; i++){
        if(i !== this.state.selected){
          this.hideCol(i);
        } else {
          this.state.currentCube.getCol(i).forEach((led) => {
            this.state.currentIntersecteeMeshes.push(led.mesh);
          });
        }
      }
    }
    this.state.onSelectedHook();
  }

  private showRow(r: number){
    this.state.currentCube.getRow(r).forEach((led) => {
      led.addTo(this.scene);
      if(r === this.state.highlighted.index){
        led.material.color.setHex(this.options.initLedHighlightColor);
      }
    });
  }

  private hideRow(r: number){
    this.state.currentCube.getRow(r).forEach((led) => {
      led.removeFrom(this.scene);
    });
  }

  private showCol(c: number){
    this.state.currentCube.getCol(c).forEach((led) => {
      led.addTo(this.scene);
      if(c === this.state.highlighted.index){
        led.material.color.setHex(this.options.initLedHighlightColor);
      }
    });
  }

  private hideCol(c: number){
    this.state.currentCube.getCol(c).forEach((led) => {
      led.removeFrom(this.scene);
    });
  }

  private changeHighlight(arrow: string){
    if(this.state.selected === -1){
      if(this.state.highlighted.mode === "row"){
        if(arrow === "ArrowUp" || arrow === "KeyW"){
          if(this.state.highlighted.index < (this.options.cubeDimensions - 1)){
            this.state.highlighted.index++;
          }
        } else if(arrow === "ArrowDown" || arrow === "KeyS"){
          if(this.state.highlighted.index > 0){
            this.state.highlighted.index--;
          }
        }
        this.clearHighlights();
        this.highlightRow(this.state.highlighted.index);

      } else if(this.state.highlighted.mode === "col"){
        if(arrow === "ArrowLeft" || arrow === "KeyA"){
          if(this.state.highlighted.index < (this.options.cubeDimensions - 1)){
            this.state.highlighted.index++;
          }
        } else if(arrow === "ArrowRight" || arrow === "KeyD"){
          if(this.state.highlighted.index > 0){
            this.state.highlighted.index--;
          }
        }
        this.clearHighlights();
        this.highlightCol(this.state.highlighted.index);
      }
    }
  }

  private changeHighlightMode(){
    if(this.state.highlighted.mode === "row"){
      this.state.highlighted.mode = "col";
      this.state.highlighted.index = 0;
      this.clearHighlights();
      this.highlightCol(this.state.highlighted.index);

    } else if(this.state.highlighted.mode === "col"){
      this.state.highlighted.mode = "none";
      this.state.highlighted.index = -1;
      this.clearHighlights();

    } else if(this.state.highlighted.mode === "none"){
      this.state.highlighted.mode = "row";
      this.state.highlighted.index = 0;
      this.clearHighlights();
      this.highlightRow(this.state.highlighted.index);

    }
    this.state.onHighlightedChangeHook();
  }

  private clearHighlights(){
    for(var i = 0; i < this.options.cubeDimensions; i++){
      this.unHighlightRow(i);
      this.unHighlightCol(i);
    }
  }

  private activateClearMode(){
    this.state.currentCube.forAllLeds((i,j,k,led) => {
      if(!led.state){
        led.removeFrom(this.scene);
      }
    })
  }

  private deactivateClearMode(){
    this.state.currentCube.forAllLeds((i,j,k,led) => {
      led.addTo(this.scene);
    })
  }

  private changeMode(){
    if(this.state.mode === "view"){
      this.state.mode = "edit";
      this.state.highlighted.mode = "none";
      this.state.highlighted.index = -1;
    } else if(this.state.mode === "edit"){
      this.activateClearMode();
      this.state.mode = "clear";
    } else if(this.state.mode === "clear"){
      this.deactivateClearMode();
      this.state.mode = "view";
    }
    this.clearHighlights();
    this.state.onModeChangeHook();
    this.state.onHighlightedChangeHook();
    this.state.onSelectedHook();
  }

  private highlightCol(c: number){
    var color = this.options.initLedHighlightColor;
    var col = this.state.currentCube.getCol(c);

    for(var i = 0; i < (this.options.cubeDimensions * this.options.cubeDimensions); i++){
      if(col[i].mesh.material.color.getHex() !== this.options.initLedSelectColor){
        col[i].mesh.material.color.setHex(color);
      }
    }
  }

  private unHighlightCol(c: number){
    var color = this.options.initLedColor;
    var col = this.state.currentCube.getCol(c);

    for(var i = 0; i < (this.options.cubeDimensions * this.options.cubeDimensions); i++){
      if(col[i].mesh.material.color.getHex() !== this.options.initLedSelectColor){
        col[i].mesh.material.color.setHex(color);
      }
    }
  }

  private highlightRow(r: number){
    var color = this.options.initLedHighlightColor;
    var row = this.state.currentCube.getRow(r);

    for(var i = 0; i < (this.options.cubeDimensions * this.options.cubeDimensions); i++){
      if(row[i].mesh.material.color.getHex() !== this.options.initLedSelectColor){
        row[i].mesh.material.color.setHex(color);
      }
    }
  }

  private unHighlightRow(r: number){
    var color = this.options.initLedColor;
    var row = this.state.currentCube.getRow(r);

    for(var i = 0; i < (this.options.cubeDimensions * this.options.cubeDimensions); i++){
      if(row[i].mesh.material.color.getHex() !== this.options.initLedSelectColor){
        row[i].mesh.material.color.setHex(color);
      }
    }
  }

  private expandCube(){
    if(this.state.currentCube.getSpacing() >= this.options.maxCubeSpacing){
      return;
    }
    this.state.currentCube.space(0.5);
    this.camera.position.z += 25;
  }

  private contractCube(){
    if(this.state.currentCube.getSpacing() <= this.options.initCubeSpacing){
      return;
    }
    this.state.currentCube.space(-0.5);
    this.camera.position.z -= 25;
  }

  public handleMouseMove(event: any){
    if(!this.state.mouse){
      this.state.mouse = new THREE.Vector2(0,0);
    }
    this.state.mouse.x = ( event.clientX / this.getWidth() ) * 2 - 1;
    this.state.mouse.y = - ( event.clientY / this.getHeight() ) * 2 + 1;
  }

  public handleMouse(event: any, updown: boolean){
    this.handleMouseClick(updown);
  }

  public handleKeyboard(event: any, updown: boolean){
    switch(event.code){
      case "Space": {
        if(updown && this.state.mode === "edit" && this.state.highlighted.mode !== "none"){
          if(this.state.selected === -1){
            this.handleSelect();
          } else {
            this.handleDeselect();
          }
        }
        break;
      }
      case "AltLeft":
      case "AltRight": {
        if(updown && this.state.mode === "edit" && this.state.selected === -1){
          this.changeHighlightMode();
        }
        break;
      }
      case "Tab": {
        if(updown){
          this.changeMode();
          event.preventDefault();
        }
        break;
      }
      case "ArrowUp":
      case "ArrowDown":
      case "ArrowLeft":
      case "ArrowRight":
      case "KeyW":
      case "KeyS":
      case "KeyA":
      case "KeyD": {
        if(updown && this.state.mode === "edit" && this.state.highlighted.mode !== "none"){
          this.changeHighlight(event.code);
        }
        break;
      }
      case "Minus":
      case "NumpadSubtract": {
        if(event.key === "-" && updown){
          this.contractCube();
        }
        break;
      }
      case "Equal":
      case "NumpadAdd": {
        if(event.key === "+" && updown){
          this.expandCube();
        }
        break;
      }
      case "KeyC": {
        if(updown && event.ctrlKey){
          this.copyRowCol();
        }
        break;
      }
      case "KeyV": {
        if(updown && event.ctrlKey){
          this.pasteRowCol();
        }
        break;
      }
      case "KeyY": {
        if(updown){
          console.log(this.state.currentCube.state);
        }
      }
      default:
        return;
    }
  }

  public handleResize(event: any){
    this.state.domElement.width = (this.options.widthPercentage / 100) * event.target.innerWidth;
    this.state.domElement.height = (this.options.heightPercentage / 100) * event.target.innerHeight;
    this.camera.aspect = this.getWidth() / this.getHeight();
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.getWidth(), this.getHeight());
  }

  public getMode(){
    return this.state.mode;
  }

  public registerModeChangeHook(hook: Function){
    this.state.onModeChangeHook = hook;
    this.state.onModeChangeHook();
  }

  public getHighlighted(){
    return this.state.highlighted;
  }

  public registerHighlightedChangeHook(hook: Function){
    this.state.onHighlightedChangeHook = hook;
    this.state.onHighlightedChangeHook();
  }

  public getSelected(){
    return this.state.selected;
  }

  public registerSelectedHook(hook: Function){
    this.state.onSelectedHook = hook;
    this.state.onSelectedHook();
  }


}
