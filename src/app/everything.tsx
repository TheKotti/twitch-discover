"use client";

import Image from "next/image";
import { getTwitchStreams } from "./actions";
import { useState } from "react";
import type { GameOption, SimpleGame, Stream } from "../../types";
import { useLocalStorage } from "./hooks";

import SearchModal from "./searchModal";
import { Chip } from "@mui/material";

async function getStreams(
  gameIdsParam: string,
  blacklistedTags: string[],
  blacklistedUsers: string[]
) {
  const formData = new FormData();
  formData.append("gameIds", gameIdsParam);
  formData.append("blacklistedTags", JSON.stringify(blacklistedTags));
  formData.append("blacklistedUsers", JSON.stringify(blacklistedUsers));
  const res = await getTwitchStreams(formData);
  if (res) {
    console.log("aaa ");
  } else {
    console.log("wwww");
    return [];
  }
  return res;
}

export default function Everything() {
  const { value: followedGames, setValue: setFollowedGames } = useLocalStorage<
    GameOption[]
  >("followedGames", []);
  const { value: blacklistedTags, setValue: setBlacklistedTags } =
    useLocalStorage<string[]>("blacklistedTags", []);
  const { value: blacklistedUsers, setValue: setBlacklistedUsers } =
    useLocalStorage<string[]>("blacklistedUsers", []);

  const [streams, setStreams] = useState<Stream[]>([]);

  const handleStreamGet = async () => {
    const ids = followedGames.map((x) => x.id);
    const idString = "igdb_id=" + ids.join("&igdb_id=");
    const res = await getStreams(idString, blacklistedTags, blacklistedUsers);
    console.log(res);
    setStreams(res);
  };

  const handleFollowedGameClick = (clickedGame: SimpleGame) => {
    if (followedGames.some((game) => game.id === clickedGame.id)) {
      const filtered = followedGames.filter((x) => x.id !== clickedGame.id);
      setFollowedGames(filtered);
    }
  };

  const handleSearchedGameClick = (clickedGame: GameOption) => {
    if (followedGames.some((game) => game.id === clickedGame.id)) {
      const filtered = followedGames.filter((x) => x.id !== clickedGame.id);
      setFollowedGames(filtered);
    } else {
      setFollowedGames([...followedGames, clickedGame]);
    }
  };

  const handleTagBlacklistToggle = (tag: string) => {
    if (blacklistedTags.includes(tag)) {
      const filtered = blacklistedTags.filter((x) => x !== tag);
      setBlacklistedTags(filtered);
    } else {
      setBlacklistedTags((prev) => [...prev, tag]);
    }
  };

  const handleUseBlacklist = (username: string) => {
    if (blacklistedUsers.includes(username)) {
      const filtered = blacklistedUsers.filter((x) => x !== username);
      setBlacklistedUsers(filtered);
    } else {
      setBlacklistedUsers((prev) => [...prev, username]);
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

                  <div className="flex gap-1 text-base text-cyan-500">
                    <span>
                      {x.user_name} ({x.viewer_count} viewers)
                    </span>
                    <Chip
                      label="Hide"
                      size="small"
                      onDelete={() => handleUseBlacklist(x.user_name)}
                    />
                  </div>

                  <div className="text-base">{x.game_name}</div>

                  <div className="flex gap-1 flex-wrap">
                    {x.tags.map((tag, i) => {
                      return (
                        <Chip
                          key={i}
                          label={tag}
                          onDelete={() => handleTagBlacklistToggle(tag)}
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
