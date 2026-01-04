import { GameOption, SimpleGame } from "../../types";

export function getSimpleGame(gameOption: GameOption): SimpleGame {
  return { name: gameOption.name, id: gameOption.id };
}
