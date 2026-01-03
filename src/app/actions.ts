"use server";

import type { Stream } from "../../types";

export async function getIgdbToken() {
  try {
    const url = `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`;
    const res = await fetch(url, { method: "POST" });
    const json = await res.json();
    return json.access_token;
  } catch (error) {
    console.log("Error in get igdb token action:", error);
    return false;
  }
}

export async function searchIgdbAction(formData: FormData) {
  try {
    const authToken = String(formData.get("authToken"));
    const searchTerm = String(formData.get("searchTerm"));

    const url = `https://api.igdb.com/v4/games`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Client-ID": process.env.TWITCH_CLIENT_ID!,
        Authorization: `Bearer ${authToken}`,
      },
      body: `
                    search "${searchTerm}";
                    fields name, id, release_dates.y, url;
                    limit 50;
                    where version_parent = null & game_type = (0, 3, 4, 8) & rating != null;`,
    });
    const foundGames = await res.json();
    return foundGames;
  } catch (error) {
    console.log("Error in search igdb action:", error);
    return false;
  }
}

export async function getTwitchStreams(formData: FormData) {
  try {
    const authToken = await getIgdbToken();
    const gameIgdbIds = String(formData.get("gameIds"));
    const idUrl = `https://api.twitch.tv/helix/games?${gameIgdbIds}`;
    console.log(idUrl);
    const idRes = await fetch(idUrl, {
      headers: {
        Accept: "application/json",
        "Client-ID": process.env.TWITCH_CLIENT_ID!,
        Authorization: `Bearer ${authToken}`,
      },
    });
    const gameIdsJson = await idRes.json();
    console.log(gameIdsJson);
    const gameIds = gameIdsJson.data.map((x: { id: string }) => x.id);
    const gameIdsString = "game_id=" + gameIds.join("&game_id=");
    console.log(gameIdsString);

    const languageString = "&language=fi&language=en";

    const url = `https://api.twitch.tv/helix/streams?${gameIdsString}${languageString}&type=live&first=100`;
    console.log(url);
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "Client-ID": process.env.TWITCH_CLIENT_ID!,
        Authorization: `Bearer ${authToken}`,
      },
    });
    const json = await res.json();
    const blacklistedTags = [""].map((x) => x.toUpperCase());
    const blacklistedStreams = [""].map((x) => x.toUpperCase());
    const filtered = json.data.filter(
      (stream: Stream) =>
        !stream.tags.some(
          (tag: string) =>
            blacklistedTags.includes(tag.toUpperCase()) ||
            blacklistedStreams.includes(stream.user_name.toUpperCase())
        )
    );
    console.log("streams", filtered);

    return filtered;
  } catch (error) {
    console.log("Error in get user action:", error);
    return false;
  }
}
