import * as THREE from 'three-full';

export class Led {

  private _mesh: THREE.Mesh;
  private _state: boolean;
  private _coordinates: Object;

  constructor(geometry: THREE.BoxBufferGeometry, position: THREE.Vector3, initSize: number, color: number, opacity: number, coordinates: Object){
    this._mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: color }));
    this._mesh.position.x = position.x;
    this._mesh.position.y = position.y;
    this._mesh.position.z = position.z;
    this._mesh.scale.x = initSize;
    this._mesh.scale.y = initSize;
    this._mesh.scale.z = initSize;
    this._mesh.userData.type = 1;
    this._mesh.material.opacity = opacity;
    this._mesh.material.transparent = true;
    this._mesh.userData = {
      led: this,
      currentHex: null
    };
    this._coordinates = coordinates;
    this._state = false;

  }

  public get geometry(): THREE.BoxBufferGeometry {return this._mesh.geometry;}
  public set geometry(geometry: THREE.BoxBufferGeometry){this._mesh.geometry = geometry;}

  public get scale(): THREE.Vector3 {return new THREE.Vector3(this._mesh.scale.x, this._mesh.scale.y, this._mesh.scale.z);}
  public set scale(scale: THREE.Vector3){
    this._mesh.scale.x = scale.x;
    this._mesh.scale.y = scale.y;
    this._mesh.scale.z = scale.z;
    this._mesh.geometry.center();
  }

  public get position(): THREE.Vector3 {return this._mesh.position;}
  public set position(position: THREE.Vector3){
    this._mesh.position.x = position.x;
    this._mesh.position.y = position.y;
    this._mesh.position.z = position.z;
  }

  public get mesh(): THREE.Mesh {return this._mesh;}
  public set mesh(mesh: THREE.Mesh){this._mesh = mesh;}

  public get material(): THREE.MeshLambertMaterial {return this._mesh.material;}
  public set material(material: THREE.MeshLambertMaterial){this._mesh.material = material;}

  public get color(): number {return this._mesh.material.color.getHex();}
  public set color(color: number) {this._mesh.material.color.setHex(color);}

  public get opacity(): number {return this._mesh.material.opacity;}
  public set opacity(opacity: number) {this._mesh.material.opacity = opacity;}

  public get coordinates(): Object {return this._coordinates;}

  public get state(): boolean {return this._state;}
  public set state(state: boolean){ this._state = state;}

  public addTo(scene: THREE.Scene){
    scene.add(this.mesh);
  }

  public removeFrom(scene: THREE.Scene){
    scene.remove(this.mesh);
  }







}
