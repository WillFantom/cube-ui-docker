import * as THREE from 'three-full';
import { Led } from './led';

export class Cube {
  private _dimensions: number;
  private _led_size: number;
  private _spacing: number;
  private _leds: any[];
  private _geometry: THREE.BoxBufferGeometry;
  private _currentScale = 1;

  constructor(dimensions: number, led_size: number, spacing: number){
    this._dimensions = dimensions;
    this._led_size = led_size;
    this._spacing = spacing;
    this._leds = [];
    this._geometry = new THREE.BoxBufferGeometry( 1, 1, 1 );
    this._leds = [];
    for(var i = 0; i < this._dimensions; i++){
      this._leds.push([]);
      for(var j = 0; j < this._dimensions; j++){
        this._leds[i].push([]);
      }
    }

    var increment = this._led_size + this._spacing;
    var positionOffset = (this._dimensions - 1) / 2;
    this.forAllLeds((i,j,k,led) => {
      var x = (i - positionOffset) * increment,
          y = (j - positionOffset) * increment,
          z = (k - positionOffset) * increment;
      var l = new Led(this._geometry, new THREE.Vector3(x,y,z), this._led_size, 0x0CBCDC, 0.45, {i: i, j: j, k: k});
      this._leds[i][j].push(l);
    });
  }

  public getLed(x: number, y: number, z: number){
      return this._leds[x][y][z];
  }

  public get dimensions(){return this._dimensions; }

  public addTo(scene: THREE.Scene){
    this.forAllLeds((i,j,k,led) => {
      led.addTo(scene);
    })
  }

  private forAllLeds(callback){
    for(var i = 0; i < this._dimensions; i ++) {
      for(var j = 0; j < this._dimensions; j ++) {
        for(var k = 0; k < this._dimensions; k ++) {
          callback(i, j, k, this._leds[i][j][k]);
        }
      }
    }
  }

  public space(space: number){
    this._spacing += space * 2;
    var increment = this._led_size + this._spacing;
    var positionOffset = (this._dimensions - 1) / 2;
    this.forAllLeds((i,j,k,led) => {
      var x = (i - positionOffset) * increment,
          y = (j - positionOffset) * increment,
          z = (k - positionOffset) * increment;
          led.position = new THREE.Vector3(x,y,z);
          led.scale = new THREE.Vector3(this._led_size, this._led_size, this._led_size);
    });
  }

  public scale(scale: number){
    this._led_size += scale;
    var increment = this._led_size + this._spacing;
    var positionOffset = (this._dimensions - 1) / 2;
    this.forAllLeds((i,j,k,led) => {
      var x = (i - positionOffset) * increment,
          y = (j - positionOffset) * increment,
          z = (k - positionOffset) * increment;
          led.position = new THREE.Vector3(x,y,z);
          led.scale = new THREE.Vector3(this._led_size, this._led_size, this._led_size);
    });
  }

  public getMeshes(): any[]{
    var meshes = [];
    this.forAllLeds((i,j,k,led) => {
      meshes.push(led.mesh);
    })
    return meshes;
  }

  public getRow(row: number): Led[]{
    var leds = [];
    for(var i = 0; i < this._dimensions; i++){
      for(var j = 0; j < this._dimensions; j++){
        leds.push(this._leds[i][row][j]);
      }
    }
    return leds;
  }

  public getCol(col: number): Led[]{
    var leds = [];
    for(var i = 0; i < this._dimensions; i++){
      for(var j = 0; j < this._dimensions; j++){
        leds.push(this._leds[i][j][col]);
      }
    }
    return leds;
  }


}
