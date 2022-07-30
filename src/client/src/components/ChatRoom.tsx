// @ts-nocheck
import React from "react";
import Colyseus, { Room } from "colyseus.js";
import * as styled from "styled-components";

export const ChatRoom = () => {
  var host = window.document.location.host.replace(/:.*/, "");

  var client = new Colyseus.Client(
    location.protocol.replace("http", "ws") +
      "//" +
      host +
      (location.port ? ":" + location.port : "")
  );
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

  return <ChatBox id="messages" />;
};

const ChatBox = styled.div`
  width: 400px;
  height: 200px;
  position: absolute;
  right: 0px;
  bottom: 0px;
  border: 1px solid black;
`;
