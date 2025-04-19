import { GameState } from '../models/GameState';
import { Command } from '../models/Command';

export class WebSocketService {
  private socket: WebSocket;
  public onMessage: (data: GameState) => void = () => {};
  public onConnect: () => void = () => {};
  public onDisconnect: () => void = () => {};
  public onError: (error: Event) => void = () => {};

  constructor() {
    // URL do servidor WebSocket
    const wsUrl = 'ws://localhost:8765';
    this.socket = new WebSocket(wsUrl);
    
    this.socket.onopen = () => {
      console.log('Conexão WebSocket estabelecida');
      this.onConnect();
    };
    
    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.onMessage(data);
      } catch (error) {
        console.error('Erro ao processar mensagem:', error);
      }
    };
    
    this.socket.onclose = () => {
      console.log('Conexão WebSocket fechada');
      this.onDisconnect();
    };
    
    this.socket.onerror = (error) => {
      console.error('Erro WebSocket:', error);
      this.onError(error);
    };
  }

  public sendCommand(command: Command): void {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(command));
    } else {
      console.warn('WebSocket não está conectado');
    }
  }

  public reconnect(): void {
    if (this.socket.readyState === WebSocket.CLOSED) {
      this.socket = new WebSocket('ws://localhost:8765');
    }
  }

  public close(): void {
    this.socket.close();
  }
}