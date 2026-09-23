var GameState;
(function (GameState) {
    GameState[GameState["PlayingMazdle"] = 0] = "PlayingMazdle";
    GameState[GameState["MainMenu"] = 1] = "MainMenu";
    GameState[GameState["Settings"] = 2] = "Settings";
    GameState[GameState["DuckWatching"] = 3] = "DuckWatching";
})(GameState || (GameState = {}));
export default GameState;
