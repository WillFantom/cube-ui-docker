import * as THREE from 'three-full';
import { Cube } from './cube';

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
    backgroundColor: number,
    axesHelper: boolean,
    initLedColor: number,
    initLedOpacity: number,
    initLedHighlightColor: number,
    devicePixelRatio: number,
    widthPercentage: number,
    heightPercentage: number
  };

  // editor state
  private state: {
    mouse: THREE.Vector2,
    currentIntersect: any,
    currentIntersecteeMeshes: any[],
    domElement: any,
    cubes: Cube[],
    currentCube: Cube
  };

  constructor(domElement: any, options: Partial<Object> = {}){
    // prep options
    this.options = Object.assign({
      initCubeSize: 3,
      cubeDimensions: 8,
      initCubeSpacing: 0.5,
      backgroundColor: 0x252525,
      axesHelper: true,
      initLedColor: 0x0CBCDC,
      initLedOpacity: 0.45,
      initLedHighlightColor: 0xff0000,
      devicePixelRatio: window.devicePixelRatio,
      widthPercentage: 100,
      heightPercentage: 100
    }, options);

    this.state = {
      mouse: null,
      currentIntersect: null,
      currentIntersecteeMeshes: [],
      domElement: domElement,
      cubes: [],
      currentCube: null
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
      this.options.initCubeSpacing
    );

    this.intersectWith(initCube);

    initCube.addTo(this.scene);

    this.state.cubes.push(initCube);

    this.state.currentCube = initCube;

    this.animate();

    var row = initCube.getCol(0);

    for(var i = 0; i < 64; i++){
      row[i]._mesh.material.color.setHex(0x00ff00);
    }
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
    this.controls.enablePan = true;
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

  private intersectWith(cube: Cube){
    this.state.currentIntersecteeMeshes = cube.getMeshes();
  }

  private intersect(){
    if(this.state.mouse){
      this.raycaster.setFromCamera( this.state.mouse, this.camera );
      var intersects = this.raycaster.intersectObjects(this.state.currentIntersecteeMeshes);

      if(intersects.length > 0){
        if(this.state.currentIntersect != intersects[0].object){
          if(this.state.currentIntersect){
            this.state.currentIntersect.material.color.setHex(this.state.currentIntersect.currentHex);
          }

          this.state.currentIntersect = intersects[0].object;
          this.state.currentIntersect.currentHex = this.state.currentIntersect.material.color.getHex();
          this.state.currentIntersect.material.color.setHex(0xff0000);
          console.log(this.state.currentIntersect.userData);
        }

      } else {
        if(this.state.currentIntersect){
          this.state.currentIntersect.material.color.setHex(this.state.currentIntersect.currentHex);
        }
        this.state.currentIntersect = null;
      }
    }
  }

  public expandCube(){
    // this.state.currentCube.scale(0.5);
    this.state.currentCube.space(0.5);
    this.camera.position.z += 25;
  }

  public contractCube(){
    // this.state.currentCube.scale(-0.5);
    this.state.currentCube.space(-0.5);
    this.camera.position.z -= 25;
  }

  public handleMouseMove(event: any){
    if(!this.state.mouse){
      this.state.mouse = new THREE.Vector2(0,0);
      this.state.mouse.x = ( event.clientX / this.getWidth() ) * 2 - 1;
      this.state.mouse.y = - ( event.clientY / this.getHeight() ) * 2 + 1;
    }
    this.state.mouse.x = ( event.clientX / this.getWidth() ) * 2 - 1;
    this.state.mouse.y = - ( event.clientY / this.getHeight() ) * 2 + 1;
  }

  public handleMouseClick(event: any){

  }


  public handleKeyboard(event: any){
    // if(event.ctrlKey){
    //   switch(event.key){
    //     case "+":
    //     case "-":
    //   }
    // }
  }

  public handleResize(event: any){
    this.state.domElement.width = (this.options.widthPercentage / 100) * event.target.innerWidth;
    this.state.domElement.height = (this.options.heightPercentage / 100) * event.target.innerHeight;
    this.camera.aspect = this.getWidth() / this.getHeight();
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.getWidth(), this.getHeight());
  }










}
