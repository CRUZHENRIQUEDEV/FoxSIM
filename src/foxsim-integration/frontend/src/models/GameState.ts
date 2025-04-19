export interface Vector2D {
  x: number;
  y: number;
}

export interface RobotState {
  position: Vector2D;
  rotation: number;
  velocity: Vector2D;
  angular_velocity: number;
  team: string;
  number: number;
}

export interface BallState {
  position: Vector2D;
  velocity: Vector2D;
}

export interface ScoreState {
  blue: number;
  red: number;
}

export interface GameState {
  robots: RobotState[];
  ball: BallState;
  score: ScoreState;
  time: number;
  game_started: boolean;
}
