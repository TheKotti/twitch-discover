"use client";

import Image from "next/image";
import { getTwitchStreams } from "./actions";
import { useState } from "react";
import type { GameOption, SimpleGame, Stream } from "../../types";
import { useNextQueryParams } from "./hooks";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import SearchModal from "./searchModal";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

async function getStreams(gameIdsParam: string) {
  const formData = new FormData();
  formData.append("gameIds", gameIdsParam);
  const res = await getTwitchStreams(formData);
  if (res) {
    console.log("aaa ");
  } else {
    console.log("wwww");
  }
  return res;
}

function getSimpleGame(gameOption: GameOption): SimpleGame {
  return { name: gameOption.name, id: gameOption.id };
}

export default function Home() {
  const { initialParams, updateParams } = useNextQueryParams({
    blacklistedStreams: [],
    blacklistedTags: [],
    followedGames: [],
  });
  const [streams, setStreams] = useState<Stream[]>([]);
  const [followedGames, setFollowedGames] = useState<SimpleGame[]>(() => {
    const stored = initialParams.get("followedGames");
    return stored ? (JSON.parse(stored) as SimpleGame[]) : [];
  });

  const handleStreamGet = async () => {
    const ids = followedGames.map((x) => x.id);
    const idString = "igdb_id=" + ids.join("&igdb_id=");
    const res = await getStreams(idString);
    console.log(res);
    setStreams(res);
  };

  const handleFollowedGameClick = (clickedGame: SimpleGame) => {
    if (followedGames.some((game) => game.id === clickedGame.id)) {
      const filtered = followedGames.filter((x) => x.id !== clickedGame.id);
      updateParams({ followedGames: JSON.stringify(filtered) });
      setFollowedGames(filtered);
    }
  };

  const handleSearchedGameClick = (clickedGame: GameOption) => {
    if (followedGames.some((game) => game.id === clickedGame.id)) {
      const filtered = followedGames.filter((x) => x.id !== clickedGame.id);
      updateParams({ followedGames: JSON.stringify(filtered) });
      setFollowedGames(filtered);
    } else {
      updateParams({
        followedGames: JSON.stringify([
          ...followedGames,
          getSimpleGame(clickedGame),
        ]),
      });
      setFollowedGames((prev) => [...prev, clickedGame]);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <div>
        <div>
          <div>
            <div>
              <SearchModal
                followedGames={followedGames}
                searchGameClick={handleSearchedGameClick}
                followedGameClick={handleFollowedGameClick}
              />

              <button onClick={() => handleStreamGet()}>Get streams</button>
            </div>

            <hr />

            <div className="flex gap-2 flex-wrap">
              {streams.map((x, i) => {
                return (
                  <div key={x.user_id} className="w-min">
                    <a key={i} href={"https://www.twitch.tv/" + x.user_login}>
                      <Image
                        src={x.thumbnail_url.replace(
                          "{width}x{height}",
                          "320x180"
                        )}
                        width={320}
                        height={180}
                        alt={x.user_name}
                      />
                    </a>

                    <div>
                      {x.user_name} ({x.viewer_count} viewers)
                    </div>
                    <div>{x.game_name}</div>
                    <div>
                      {x.language}, {x.tags.join(", ")}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
