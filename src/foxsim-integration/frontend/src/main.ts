import './styles/main.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { WebSocketService } from './services/WebSocketService';
import { Field } from './components/Field';
import { Robot } from './components/Robot';
import { Ball } from './components/Ball';
import { Scoreboard } from './components/Scoreboard'

class FoxSimApp {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private wsService: WebSocketService;
  
  private field: Field;
  private robots: Robot[] = [];
  private ball: Ball;
  private scoreboard: Scoreboard;

  constructor() {
    // Inicializar Three.js
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a472a);
    
    this.camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    this.camera.position.set(0, 10, 10);
    
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('scene-container')?.appendChild(this.renderer.domElement);
    
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    
    // Adicionar iluminação
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    this.scene.add(directionalLight);
    
    // Criar componentes
    this.field = new Field(this.scene);
    this.ball = new Ball(this.scene);
    this.scoreboard = new Scoreboard();
    
    // Criar robôs
    this.createRobots();
    
    // Conectar ao WebSocket
    this.wsService = new WebSocketService();
    this.wsService.onMessage = this.handleGameState.bind(this);
    
    // Configurar eventos
    this.setupEventListeners();
    
    // Iniciar loop de renderização
    this.animate();
  }
  
  private createRobots(): void {
    // Time azul
    this.robots.push(new Robot(this.scene, 'blue', 1, new THREE.Vector3(-4, 0, 0)));
    this.robots.push(new Robot(this.scene, 'blue', 2, new THREE.Vector3(-2, 0, 1)));
    this.robots.push(new Robot(this.scene, 'blue', 3, new THREE.Vector3(-2, 0, -1)));
    
    // Time vermelho
    this.robots.push(new Robot(this.scene, 'red', 1, new THREE.Vector3(4, 0, 0)));
    this.robots.push(new Robot(this.scene, 'red', 2, new THREE.Vector3(2, 0, 1)));
    this.robots.push(new Robot(this.scene, 'red', 3, new THREE.Vector3(2, 0, -1)));
  }
  
  private setupEventListeners(): void {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    document.getElementById('start-btn')?.addEventListener('click', () => {
      this.wsService.sendCommand({ command: 'start' });
    });
    
    document.getElementById('reset-btn')?.addEventListener('click', () => {
      this.wsService.sendCommand({ command: 'reset' });
    });
  }
  
  private handleGameState(gameData: any): void {
    // Atualizar posições dos robôs
    if (gameData.robots) {
      gameData.robots.forEach((robotData: any, index: number) => {
        if (index < this.robots.length) {
          this.robots[index].updatePosition(
            robotData.position[0],
            robotData.position[1],
            robotData.rotation
          );
        }
      });
    }
    
    // Atualizar posição da bola
    if (gameData.ball) {
      this.ball.updatePosition(
        gameData.ball.position[0],
        gameData.ball.position[1]
      );
    }
    
    // Atualizar placar e tempo
    if (gameData.score) {
      this.scoreboard.updateScore(gameData.score.blue, gameData.score.red);
    }
    
    if (gameData.time !== undefined) {
      this.scoreboard.updateTime(gameData.time);
    }
  }
  
  private animate(): void {
    requestAnimationFrame(this.animate.bind(this));
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

// Iniciar aplicação
window.addEventListener('DOMContentLoaded', () => {
  new FoxSimApp();
});