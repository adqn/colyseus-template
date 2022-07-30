// @ts-nocheck
import React, { useEffect } from "react";
import * as Colyseus from "colyseus.js";
import styled from "styled-components";

export const ChatRoom = () => {
  const client = new Colyseus.Client("ws://localhost:2567");

  useEffect(() => {
    client.joinOrCreate("chat").then((room) => {
      console.log("joined");
      room.onStateChange.once(function (state) {
        console.log("initial room state:", state);
      });

      // new room state
      room.onStateChange(function (state) {
        // this signal is triggered on each patch
      });

      // listen to patches coming from the server
      room.onMessage("messages", function (message) {
        var p = document.createElement("p");
        p.innerText = message;
        document.querySelector("#messages").appendChild(p);
      });

      // send message to room on submit
      document.querySelector("#form").onsubmit = function (e) {
        e.preventDefault();

        var input = document.querySelector("#input");

        console.log("input:", input.value);

        // send data to room
        room.send("message", input.value);

        // clear input
        input.value = "";
      };
    });
  }, []);

  return (
    <div>
      <form id="form">
        <input type="text" id="input" defaultValue="" autofocus />
        <input type="submit" value="send" />
      </form>
      <ChatBox id="messages" />
    </div>
  );
};

const ChatBox = styled.div`
  width: 400px;
  height: 200px;
  position: absolute;
  right: 0px;
  bottom: 0px;
  border: 1px solid black;
`;
