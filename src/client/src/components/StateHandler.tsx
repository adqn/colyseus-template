import React, { useEffect } from "react";
// import Colyseus, { Room, Client } from "colyseus.js";
import * as Colyseus from "colyseus.js";
import { Schema } from "@colyseus/schema";
import * as styled from "styled-components";

interface Player extends Schema {
  x: number;
  y: number;
  score: number;
}

interface Item extends Schema {
  x: number;
  y: number;
}

interface Object {
  top: number;
  left: number;
  height: number;
  width: number;
}

/*
      .player {
        width: 100px;
        height: 100px;
        position: absolute;
        padding-top: 24px;
        box-sizing: border-box;
        left: 0;
        top: 0;
      }

      #messages {
          width: 400px;
          height: 200px;
          position: absolute;
          right: 0px;
          bottom: 0px;
          border: 1px solid black;
      }

      #form {
          position: absolute;
          right: 0px;
          bottom: 205px;
      }

      .item {
          position: absolute;
          width: 20px;
          height: 20px;
          background: red;
          left: 0;
          top: 0;
}
*/

export const StateHandlerRoom = () => {
  const client = new Colyseus.Client("ws://localhost:2567");

  var room: Colyseus.Room;

  type Players = { [index: string]: any };
  type Items = { [index: string]: any };

  useEffect(() => {
    client.joinOrCreate("state_handler").then((room_instance) => {
      room = room_instance;
      if (room) {
        console.log("Connected to room: ", room);
      }

      const players: Players = {};
      const items: Items = {};
      const colors = ["red", "green", "yellow", "blue", "cyan", "magenta"];

      // add items
      room.state.items.onAdd = function (item: Item, itemId: string) {
        var dom = document.createElement("div");
        console.log(itemId);
        dom.className = "item";
        dom.style.left = item.x + "px";
        dom.style.top = item.y + "px";

        items[itemId] = dom;
        document.body.appendChild(dom);
      };

      // listen to patches coming from the server
      room.state.players.onAdd = function (player: Player, sessionId: string) {
        var dom = document.createElement("div");
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
        document.body.appendChild(dom);
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

        Object.keys(players).forEach((player) => {
          if (Object.keys(items).length > 0) {
            Object.keys(items).forEach((item) => {
              const playerPos = {
                top: parseInt(players[player].style.top),
                left: parseInt(players[player].style.left),
                height: parseInt(players[player].offsetHeight),
                width: parseInt(players[player].offsetWidth),
              };

              const objPos = {
                top: parseInt(items[item].style.top),
                left: parseInt(items[item].style.left),
                height: parseInt(items[item].offsetHeight),
                width: parseInt(items[item].offsetWidth),
              };

              console.log(distance(playerPos, objPos));
              // if (checkCollision(playerPos, objPos)) {
              //   console.log("item collected");
              //   room.send("collect_item", item);
              //   document.body.removeChild(items[item]);
              //   delete items[item];
              // }
            });
          }
        });
      });
    });
  }, []);

  function checkCollision(obj1: Object, obj2: Object) {
    if (
      obj1.top + obj1.height >= obj2.top &&
      obj1.left + obj1.width >= obj2.left
    ) {
      return true;
    }
  }

  function distance(obj1: Object, obj2: Object) {
    return {
      x: Math.abs(obj2.left - (obj1.left + obj1.width)),
      y: Math.abs(obj2.top + obj2.height - obj1.top),
    };
  }

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

  return <div>??</div>;
};

// const GameObject = styled.div`
//   width: ${(props: any) => props.width ?? "20px"};
//   height: ${(props: any) => props.width ?? "20px"};
//   background: ${(props: any) => props.background ?? "black"};
//   position: absolute;
//   box-sizing: border-box;
// `;
