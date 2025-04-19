import * as THREE from "three";

export class Field {
  private field: THREE.Mesh;
  private lines: THREE.Object3D[] = [];

  constructor(scene: THREE.Scene, width: number = 12, height: number = 8) {
    // Criar campo
    const fieldGeometry = new THREE.PlaneGeometry(width, height);
    const fieldMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a472a,
      roughness: 0.8,
    });
    this.field = new THREE.Mesh(fieldGeometry, fieldMaterial);
    this.field.rotation.x = -Math.PI / 2;
    this.field.receiveShadow = true;
    scene.add(this.field);

    // Adicionar linhas do campo
    this.createLines(scene, width, height);
  }

  private createLines(scene: THREE.Scene, width: number, height: number): void {
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

    // Borda do campo
    const borderPoints = [
      new THREE.Vector3(-width / 2, 0.01, -height / 2),
      new THREE.Vector3(width / 2, 0.01, -height / 2),
      new THREE.Vector3(width / 2, 0.01, height / 2),
      new THREE.Vector3(-width / 2, 0.01, height / 2),
      new THREE.Vector3(-width / 2, 0.01, -height / 2),
    ];

    const borderGeometry = new THREE.BufferGeometry().setFromPoints(
      borderPoints
    );
    const borderLine = new THREE.Line(borderGeometry, lineMaterial);
    scene.add(borderLine);
    this.lines.push(borderLine);

    // Linha central
    const centerLineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0.01, -height / 2),
      new THREE.Vector3(0, 0.01, height / 2),
    ]);
    const centerLine = new THREE.Line(centerLineGeometry, lineMaterial);
    scene.add(centerLine);
    this.lines.push(centerLine);

    // Círculo central
    const circleGeometry = new THREE.CircleGeometry(2, 32);
    circleGeometry.rotateX(-Math.PI / 2);
    circleGeometry.translate(0, 0.01, 0);
    const circleLine = new THREE.LineLoop(
      new THREE.EdgesGeometry(circleGeometry),
      lineMaterial
    );
    scene.add(circleLine);
    this.lines.push(circleLine);

    // Áreas
    const areaWidth = width * 0.2;
    const areaHeight = height * 0.6;

    // Área esquerda
    const leftAreaPoints = [
      new THREE.Vector3(-width / 2, 0.01, -areaHeight / 2),
      new THREE.Vector3(-width / 2 + areaWidth, 0.01, -areaHeight / 2),
      new THREE.Vector3(-width / 2 + areaWidth, 0.01, areaHeight / 2),
      new THREE.Vector3(-width / 2, 0.01, areaHeight / 2),
    ];

    const leftAreaGeometry = new THREE.BufferGeometry().setFromPoints(
      leftAreaPoints
    );
    const leftAreaLine = new THREE.LineLoop(leftAreaGeometry, lineMaterial);
    scene.add(leftAreaLine);
    this.lines.push(leftAreaLine);

    // Área direita
    const rightAreaPoints = [
      new THREE.Vector3(width / 2, 0.01, -areaHeight / 2),
      new THREE.Vector3(width / 2 - areaWidth, 0.01, -areaHeight / 2),
      new THREE.Vector3(width / 2 - areaWidth, 0.01, areaHeight / 2),
      new THREE.Vector3(width / 2, 0.01, areaHeight / 2),
    ];

    const rightAreaGeometry = new THREE.BufferGeometry().setFromPoints(
      rightAreaPoints
    );
    const rightAreaLine = new THREE.LineLoop(rightAreaGeometry, lineMaterial);
    scene.add(rightAreaLine);
    this.lines.push(rightAreaLine);
  }
}
