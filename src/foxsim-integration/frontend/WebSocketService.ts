// WebSocketService.ts
import { GameState } from "../frontend/src/models/GameState";
import { Command } from "../frontend/src/models/Command";

export class WebSocketService {
  private socket: WebSocket;
  public onMessage: (data: GameState) => void = () => {};
  public onConnect: () => void = () => {};
  public onDisconnect: () => void = () => {};
  public onError: (error: Event) => void = () => {};

  constructor() {
    // URL do servidor WebSocket
    const wsUrl = "ws://localhost:8765";
    this.connect(wsUrl);
  }

  private connect(url: string) {
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log("Conexão WebSocket estabelecida");
      this.onConnect();
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Converter estrutura de dados para o formato esperado pelo frontend
        const gameState: GameState = {
          robots: data.robots.map((robot: any) => ({
            position: { x: robot.position[0], y: robot.position[1] },
            rotation: robot.rotation,
            velocity: { x: robot.velocity[0], y: robot.velocity[1] },
            angular_velocity: robot.angular_velocity,
            team: robot.team,
            number: robot.number,
          })),
          ball: {
            position: { x: data.ball.position[0], y: data.ball.position[1] },
            velocity: { x: data.ball.velocity[0], y: data.ball.velocity[1] },
          },
          score: {
            blue: data.score[0],
            red: data.score[1],
          },
          time: data.time,
          game_started: data.game_started,
        };

        this.onMessage(gameState);
      } catch (error) {
        console.error("Erro ao processar mensagem:", error);
      }
    };

    this.socket.onclose = () => {
      console.log("Conexão WebSocket fechada");
      this.onDisconnect();

      // Tentar reconectar após 5 segundos
      setTimeout(() => {
        console.log("Tentando reconectar...");
        this.connect(url);
      }, 5000);
    };

    this.socket.onerror = (error) => {
      console.error("Erro WebSocket:", error);
      this.onError(error);
    };
  }

  public sendCommand(command: Command): void {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(command));
    } else {
      console.warn("WebSocket não está conectado");
    }
  }

  public close(): void {
    this.socket.close();
  }
}
