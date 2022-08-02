import React, { useEffect } from "react";
import * as Colyseus from "colyseus.js";
import { Schema } from "@colyseus/schema";
import "../styles/default.css";

interface Player extends Schema {
  x: number;
  y: number;
}

export const StateHandlerRoom = () => {
  const client = new Colyseus.Client("ws://localhost:2567");
  let room: Colyseus.Room;

  type Players = { [index: string]: any };

  useEffect(() => {
    client.joinOrCreate("state_handler").then((room_instance) => {
      room = room_instance;
      if (room) {
        console.log("Connected to room: ", room);
      }

      const players: Players = {};
      const colors = ["red", "green", "yellow", "blue", "cyan", "magenta"];

      // listen to patches coming from the server
      room.state.players.onAdd = function (player: Player, sessionId: string) {
        const dom = document.createElement("div");
        dom.className = "player";
        dom.style.left = player.x + "px";
        dom.style.top = player.y + "px";
        dom.style.background =
          colors[Math.floor(Math.random() * colors.length)];
        dom.innerText = "Player " + sessionId;

        player.onChange = function (changes) {
          dom.style.left = player.x + "px";
          dom.style.top = player.y + "px";
        };

        players[sessionId] = dom;
        document.getElementById("screen")?.appendChild(dom);
      };

      room.state.players.onRemove = function (
        player: Player,
        sessionId: string
      ) {
        document.body.removeChild(players[sessionId]);
        delete players[sessionId];
      };

      room.onMessage("hello", (message) => {
        console.log(message);
      });

      window.addEventListener("keydown", function (e) {
        if (e.which === 38) {
          up();
        } else if (e.which === 39) {
          right();
        } else if (e.which === 40) {
          down();
        } else if (e.which === 37) {
          left();
        }
      });
    });
  }, []);

  function up() {
    room.send("move", { y: -1 });
  }

  function right() {
    room.send("move", { x: 1 });
  }

  function down() {
    room.send("move", { y: 1 });
  }

  function left() {
    room.send("move", { x: -1 });
  }

  return (
    <div id="screen">
      <svg id="overlay" width="100%" height="100%" />
    </div>
  );
};
