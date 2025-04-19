export interface Command {
  command: "start" | "reset" | "pause" | "resume" | "set_speed";
  params?: any;
}
