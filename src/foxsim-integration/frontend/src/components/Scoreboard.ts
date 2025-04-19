export class Scoreboard {
  private timerElement: HTMLElement | null;
  private scoreElement: HTMLElement | null;

  constructor() {
    this.timerElement = document.getElementById("timer");
    this.scoreElement = document.getElementById("score");
  }

  public updateScore(blueScore: number, redScore: number): void {
    if (this.scoreElement) {
      this.scoreElement.textContent = `${blueScore} - ${redScore}`;
    }
  }

  public updateTime(seconds: number): void {
    if (this.timerElement) {
      const minutes = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      this.timerElement.textContent = `${minutes
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
  }
}
