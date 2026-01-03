"use client";

import Image from "next/image";
import { getIgdbToken, getTwitchStreams, searchIgdbAction } from "./actions";
import { useEffect, useState } from "react";
import type { GameOption, Stream } from "../../types";
import { useLocalStorage } from "./hooks";

async function searchIgdb(searchTerm: string, authToken: string) {
  const formData = new FormData();
  formData.append("searchTerm", searchTerm);
  formData.append("authToken", authToken);
  const res = await searchIgdbAction(formData);
  if (res) {
    console.log("searched ");
  } else {
    console.log("searched failed");
  }
  return res;
}

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

export default function Home() {
  const [token, setToken] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [options, setOptions] = useState<GameOption[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);

  const [followedGames, setFollowedGames] = useLocalStorage<GameOption[]>(
    "followedGames",
    []
  );
  const [bannedTags, setBannedTags] = useLocalStorage<string[]>(
    "followedGames",
    []
  );

  useEffect(() => {
    async function fetchToken() {
      const tokenRes = await getIgdbToken();
      setToken(tokenRes);
    }

    fetchToken();
  }, []);

  const handleSearch = async () => {
    const res = await searchIgdb(searchTerm, token);
    setOptions(res || []);
  };

  const handleStreamGet = async () => {
    const ids = followedGames.map((x) => x.id);
    const idString = "igdb_id=" + ids.join("&igdb_id=");
    const res = await getStreams(idString);
    console.log(res);
    setStreams(res);
  };

  const toggleFollow = (clickedGame: GameOption) => {
    if (followedGames.some((game) => game.id === clickedGame.id)) {
      setFollowedGames(followedGames.filter((x) => x.id !== clickedGame.id));
    } else {
      setFollowedGames((prev) => [...prev, clickedGame]);
    }
  };

  return (
    <div>
      <div>
        <div>
          <div>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <button onClick={() => handleSearch()} disabled={!token}>
              Search gaems
            </button>

            <button onClick={() => handleStreamGet()}>Get streams</button>

            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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

          <hr />

          {followedGames.map((x, i) => {
            const years = x.release_dates?.map((r: { y: number }) => r.y) || [];
            const initialYear = Math.min(...years);
            return (
              <div
                key={i}
                onClick={() => toggleFollow(x)}
                className={`cursor-pointer w-fit text-green-500`}
              >
                {`${x.name} (${initialYear})`}
              </div>
            );
          })}

          <hr />

          {options.map((x, i) => {
            const years = x.release_dates?.map((r: { y: number }) => r.y) || [];
            const initialYear = Math.min(...years);
            return (
              <div
                key={i}
                onClick={() => toggleFollow(x)}
                className={`cursor-pointer w-fit ${
                  followedGames.some((game) => game.id === x.id)
                    ? "text-green-500"
                    : ""
                }`}
              >
                {`${x.name} (${initialYear})`}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
