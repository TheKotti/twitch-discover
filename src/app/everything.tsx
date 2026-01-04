"use client";

import Image from "next/image";
import { getTwitchStreams } from "./actions";
import { useState } from "react";
import type { GameOption, SimpleGame, Stream } from "../../types";
import { useNextQueryParams } from "./hooks";

import SearchModal from "./searchModal";
import { Chip } from "@mui/material";

async function getStreams(gameIdsParam: string, blacklistedTags: string[]) {
  const formData = new FormData();
  formData.append("gameIds", gameIdsParam);
  formData.append("blacklistedTags", JSON.stringify(blacklistedTags));
  const res = await getTwitchStreams(formData);
  if (res) {
    console.log("aaa ");
  } else {
    console.log("wwww");
    return [];
  }
  return res;
}

function getSimpleGame(gameOption: GameOption): SimpleGame {
  return { name: gameOption.name, id: gameOption.id };
}

export default function Everything() {
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
  const [blacklistedTags, setBlacklistedTags] = useState<string[]>(() => {
    const stored = initialParams.get("blacklistedTags");
    return stored ? (JSON.parse(stored) as string[]) : [];
  });

  const handleStreamGet = async () => {
    const ids = followedGames.map((x) => x.id);
    const idString = "igdb_id=" + ids.join("&igdb_id=");
    const res = await getStreams(idString, blacklistedTags);
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

  const handleTagBlackListToggle = (tag: string) => {
    if (blacklistedTags.includes(tag)) {
      const filtered = blacklistedTags.filter((x) => x !== tag);
      updateParams({ blacklistedTags: filtered });
      setBlacklistedTags(filtered);
    } else {
      console.log("asdasd", [...blacklistedTags, tag]);
      updateParams({
        blacklistedTags: JSON.stringify([...blacklistedTags, tag]),
      });
      setBlacklistedTags((prev) => [...prev, tag]);
    }
  };

  return (
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

                  <div className="text-sm">{x.title}</div>

                  <div className="text-base text-cyan-500">
                    {x.user_name} ({x.viewer_count} viewers)
                  </div>

                  <div className="text-base">{x.game_name}</div>

                  <div className="flex gap-1 flex-wrap">
                    {x.tags.map((tag) => {
                      return (
                        <Chip
                          key={tag}
                          label={tag}
                          onDelete={() => handleTagBlackListToggle(tag)}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
