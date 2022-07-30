import { Room, Client } from "colyseus";
import { Schema, type, MapSchema } from "@colyseus/schema";

export class Player extends Schema {
    @type("number")
    x = 100;

    @type("number")
    y = Math.floor(Math.random() * 200);

    @type("number")
    score = 0;
}

export class Item extends Schema {
    @type("number")
    x = Math.floor(Math.random() * 300);

    @type("number")
    y = Math.floor(Math.random() * 300);
}

export class State extends Schema {
    @type({ map: Player })
    players = new MapSchema<Player>();

    @type({ map: Item })
    items = new MapSchema<Item>();

    something = "This attribute won't be sent to the client-side";

    createPlayer(sessionId: string) {
        this.players.set(sessionId, new Player());
    }

    removePlayer(sessionId: string) {
        this.players.delete(sessionId);
    }

    movePlayer (sessionId: string, movement: any) {
        if (movement.x) {
            this.players.get(sessionId).x += movement.x * 10;

        } else if (movement.y) {
            this.players.get(sessionId).y += movement.y * 10;
        }
    }

    createItem(itemId: string) {
        this.items.set(itemId, new Item());
    }

    collectItem(sessionId: string, itemId: any) {
        this.players.get(sessionId).score += 1;
        console.log("Player 1 score: ", this.players.get(sessionId).score);
        this.items.delete(itemId);
    }
}

export class StateHandlerRoom extends Room<State> {
    maxClients = 4;

    onCreate (options) {
        console.log("StateHandlerRoom created!", options);

        this.setState(new State());

        this.onMessage("move", (client, data) => {
            // console.log("StateHandlerRoom received message from", client.sessionId, ":", data);
            this.state.movePlayer(client.sessionId, data);
        });

        this.onMessage("collect_item", (client, data) => {
            console.log("Item collected: ", data);
            this.state.collectItem(client.sessionId, data);
        })

        for (let i = 0; i < 10; ++i) {
            this.state.createItem(`apple_${i}`);
        }
    }

    onAuth(client, options, req) {
        return true;
    }

    onJoin (client: Client) {
        client.send("hello", "world");
        this.state.createPlayer(client.sessionId);
    }

    onLeave (client) {
        this.state.removePlayer(client.sessionId);
    }

    onDispose () {
        console.log("Dispose StateHandlerRoom");
    }

}
