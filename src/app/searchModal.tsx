"use client";

import { getIgdbToken, searchIgdbAction } from "./actions";
import { useEffect, useState } from "react";
import type { GameOption, SimpleGame } from "../../types";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80vw",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

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

type Props = {
  followedGames: SimpleGame[];
  searchGameClick: (clickedGame: GameOption) => void;
  followedGameClick: (clickedGame: SimpleGame) => void;
};

export default function SearchModal(props: Props) {
  const { followedGames, searchGameClick, followedGameClick } = props;

  const [token, setToken] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [options, setOptions] = useState<GameOption[]>([]);

  const [gameModalOpen, setGameModalOpen] = useState(false);

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

  const handleSearchedGameClick = (clickedGame: GameOption) => {
    searchGameClick(clickedGame);
  };

  return (
    <>
      <Button onClick={() => setGameModalOpen(true)}>Open modal</Button>

      <Modal
        open={gameModalOpen}
        onClose={() => setGameModalOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Typography id="modal-modal-title" variant="h6" component="h2">
                Search games
              </Typography>

              <div className="flex py-2">
                <TextField
                  id="standard-basic"
                  variant="outlined"
                  size="small"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                <Button onClick={handleSearch}>Search</Button>
              </div>
              {options.map((x, i) => {
                const years =
                  x.release_dates?.map((r: { y: number }) => r.y) || [];
                const initialYear = Math.min(...years);
                return (
                  <div
                    key={i}
                    onClick={() => handleSearchedGameClick(x)}
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

            <div>
              <Typography id="modal-modal-title" variant="h6" component="h2">
                Followed games
              </Typography>

              {followedGames.map((x, i) => {
                return (
                  <div
                    key={i}
                    onClick={() => followedGameClick(x)}
                    className={`cursor-pointer w-fit text-green-500`}
                  >
                    {`${x.name}`}
                  </div>
                );
              })}
            </div>
          </div>
        </Box>
      </Modal>
    </>
  );
}
