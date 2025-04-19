import * as THREE from 'three';

export class Robot {
  private body: THREE.Mesh;
  private teamColor: string;
  private number: number;
  
  constructor(
    scene: THREE.Scene, 
    team: string, 
    number: number, 
    position: THREE.Vector3
  ) {
    this.teamColor = team;
    this.number = number;
    
    // Criar corpo do robô
    const bodyGeometry = new THREE.BoxGeometry(0.5, 0.3, 0.5);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: team === 'blue' ? 0x0055ff : 0xff0000 
    });
    
    this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    this.body.position.copy(position);
    this.body.position.y = 0.15; // Altura do robô
    this.body.castShadow = true;
    
    // Adicionar marcador de direção (frente do robô)
    const directionGeometry = new THREE.ConeGeometry(0.1, 0.2, 8);
    const directionMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff 
    });
    const direction = new THREE.Mesh(directionGeometry, directionMaterial);
    direction.position.set(0.2, 0, 0);
    direction.rotation.z = -Math.PI / 2;
    
    this.body.add(direction);
    scene.add(this.body);
  }
  
  public updatePosition(x: number, z: number, rotation: number): void {
    this.body.position.x = x;
    this.body.position.z = z;
    this.body.rotation.y = rotation;
  }
  
  public getPosition(): THREE.Vector3 {
    return this.body.position.clone();
  }
  
  public getRotation(): number {
    return this.body.rotation.y;
  }
}