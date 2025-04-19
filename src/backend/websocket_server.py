import asyncio
import websockets
import json
import time
import numpy as np

# Estado do jogo - apenas o essencial
game_state = {
    "game_started": False,
    "robots": [
        # Time azul
        {"position": [-4, 0], "rotation": 0, "team": "blue", "number": 1},
        {"position": [-2, 1], "rotation": 0, "team": "blue", "number": 2},
        {"position": [-2, -1], "rotation": 0, "team": "blue", "number": 3},
        # Time vermelho
        {"position": [4, 0], "rotation": 0, "team": "red", "number": 1},
        {"position": [2, 1], "rotation": 0, "team": "red", "number": 2},
        {"position": [2, -1], "rotation": 0, "team": "red", "number": 3}
    ],
    "ball": {"position": [0, 0], "velocity": [0, 0]},
    "time": 180,  # 3 minutos em segundos
    "score": [0, 0]
}

# Velocidades dos robôs
robot_velocities = [
    [0, 0], [0, 0], [0, 0],  # Time azul
    [0, 0], [0, 0], [0, 0]   # Time vermelho
]

# Simulação simplificada - mover os robôs e a bola
def update_simulation():
    global game_state
    
    if not game_state["game_started"]:
        return
    
    # Atualizar tempo
    game_state["time"] -= 1/60
    if game_state["time"] <= 0:
        game_state["time"] = 0
        game_state["game_started"] = False
    
    # Mover a bola
    ball = game_state["ball"]
    ball["position"][0] += ball["velocity"][0] * 0.01
    ball["position"][1] += ball["velocity"][1] * 0.01
    
    # Simular atrito da bola
    ball["velocity"][0] *= 0.99
    ball["velocity"][1] *= 0.99
    
    # Manter a bola no campo
    if abs(ball["position"][0]) > 6:
        ball["velocity"][0] *= -0.8
        ball["position"][0] = 6 if ball["position"][0] > 0 else -6
    
    if abs(ball["position"][1]) > 4:
        ball["velocity"][1] *= -0.8
        ball["position"][1] = 4 if ball["position"][1] > 0 else -4
    
    # Verificar gol
    if ball["position"][0] < -6 and abs(ball["position"][1]) < 1:
        game_state["score"][1] += 1  # Gol do time vermelho
        reset_ball()
    elif ball["position"][0] > 6 and abs(ball["position"][1]) < 1:
        game_state["score"][0] += 1  # Gol do time azul
        reset_ball()
    
    # IA simples para mover os robôs
    for i, robot in enumerate(game_state["robots"]):
        if robot["team"] == "blue":
            if i == 0:  # Goleiro
                robot["position"][0] = -5
                robot["position"][1] = max(-1, min(1, ball["position"][1]))
            elif i == 1:  # Defensor
                robot["position"][0] = -3
                robot["position"][1] = max(-3, min(3, ball["position"][1] * 0.7))
            else:  # Atacante
                # Movimento em direção à bola
                dx = ball["position"][0] - robot["position"][0]
                dy = ball["position"][1] - robot["position"][1]
                dist = np.sqrt(dx*dx + dy*dy)
                if dist > 0.1:
                    robot["position"][0] += dx * 0.02
                    robot["position"][1] += dy * 0.02
                # Chutar a bola
                if dist < 0.5:
                    ball["velocity"][0] = 5
                    ball["velocity"][1] = (np.random.random() - 0.5) * 2
        else:  # Time vermelho
            if i == 3:  # Goleiro
                robot["position"][0] = 5
                robot["position"][1] = max(-1, min(1, ball["position"][1]))
            elif i == 4:  # Defensor
                robot["position"][0] = 3
                robot["position"][1] = max(-3, min(3, ball["position"][1] * 0.7))
            else:  # Atacante
                # Movimento em direção à bola
                dx = ball["position"][0] - robot["position"][0]
                dy = ball["position"][1] - robot["position"][1]
                dist = np.sqrt(dx*dx + dy*dy)
                if dist > 0.1:
                    robot["position"][0] += dx * 0.02
                    robot["position"][1] += dy * 0.02
                # Chutar a bola
                if dist < 0.5:
                    ball["velocity"][0] = -5
                    ball["velocity"][1] = (np.random.random() - 0.5) * 2
        
        # Atualizar rotação com base na direção do movimento
        vx = robot["position"][0] - robot_velocities[i][0]
        vy = robot["position"][1] - robot_velocities[i][1]
        if abs(vx) > 0.01 or abs(vy) > 0.01:
            robot["rotation"] = np.arctan2(vy, vx)
        
        # Atualizar velocidades anteriores para cálculo de direção
        robot_velocities[i][0] = robot["position"][0]
        robot_velocities[i][1] = robot["position"][1]

def reset_ball():
    game_state["ball"]["position"] = [0, 0]
    game_state["ball"]["velocity"] = [0, 0]

def reset_game():
    global game_state, robot_velocities
    
    # Resetar posições dos robôs
    game_state["robots"][0]["position"] = [-4, 0]
    game_state["robots"][1]["position"] = [-2, 1]
    game_state["robots"][2]["position"] = [-2, -1]
    game_state["robots"][3]["position"] = [4, 0]
    game_state["robots"][4]["position"] = [2, 1]
    game_state["robots"][5]["position"] = [2, -1]
    
    # Resetar velocidades
    robot_velocities = [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]]
    
    # Resetar bola
    reset_ball()
    
    # Resetar placar
    game_state["score"] = [0, 0]
    
    # Resetar tempo
    game_state["time"] = 180
    
    # Parar o jogo
    game_state["game_started"] = False

# Processar comandos do frontend
def handle_command(command_data):
    global game_state
    
    if command_data["command"] == "start":
        game_state["game_started"] = True
    
    elif command_data["command"] == "reset":
        reset_game()
    
    elif command_data["command"] == "move_ball" and "position" in command_data:
        game_state["ball"]["position"] = command_data["position"]
        game_state["ball"]["velocity"] = [0, 0]

# Servidor WebSocket - correção da assinatura da função
async def game_server(websocket):  # Remova o parâmetro 'path'
    try:
        # Enviar estado inicial
        await websocket.send(json.dumps(game_state))
        
        # Loop principal de envio de estado
        async def send_game_state():
            while True:
                # Atualizar a simulação
                update_simulation()
                
                # Enviar estado atualizado
                await websocket.send(json.dumps(game_state))
                
                # 60 FPS
                await asyncio.sleep(1/60)
        
        # Iniciar tarefa de envio de estado
        send_task = asyncio.create_task(send_game_state())
        
        # Receber comandos do cliente
        async for message in websocket:
            try:
                command_data = json.loads(message)
                handle_command(command_data)
            except json.JSONDecodeError:
                print(f"Erro ao decodificar JSON: {message}")
        
        # Cancelar tarefa quando o cliente desconectar
        send_task.cancel()
        
    except websockets.exceptions.ConnectionClosed:
        print("Cliente desconectado")

# Iniciar servidor - também precisa ser atualizado
async def main():
    # Iniciar servidor WebSocket
    async with websockets.serve(game_server, "localhost", 8765):
        print("Servidor WebSocket iniciado em ws://localhost:8765")
        await asyncio.Future()  # Executar indefinidamente
        
# Iniciar servidor
async def main():
    # Iniciar servidor WebSocket
    async with websockets.serve(game_server, "localhost", 8765):
        print("Servidor WebSocket iniciado em ws://localhost:8765")
        await asyncio.Future()  # Executar indefinidamente

if __name__ == "__main__":
    asyncio.run(main())