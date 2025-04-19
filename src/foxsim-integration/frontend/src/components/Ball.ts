import * as THREE from 'three';

export class Ball {
  private mesh: THREE.Mesh;
  
  constructor(scene: THREE.Scene) {
    const geometry = new THREE.SphereGeometry(0.15, 32, 32);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      roughness: 0.2,
      metalness: 0.1
    });
    
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.y = 0.15; // Altura da bola
    this.mesh.castShadow = true;
    
    scene.add(this.mesh);
  }
  
  public updatePosition(x: number, z: number): void {
    this.mesh.position.x = x;
    this.mesh.position.z = z;
  }
  
  public getPosition(): THREE.Vector3 {
    return this.mesh.position.clone();
  }
}