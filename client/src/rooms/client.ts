import * as Colyseus from "colyseus.js";

const client = new Colyseus.Client("ws://localhost:2567");

client.joinOrCreate("test_room").then((room) => {
  console.log(room.sessionId, "join", room.name);

  room.onStateChange((state) => {
    console.log(room.name, "has new state: ", state);
  });

  room.onMessage("message_type", (message) => {
    console.log(client.joinById, "received on", room.name, message);
  });

}).catch((error) => {
  console.log("JOIN ERROR", error);
});

