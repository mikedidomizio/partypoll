import * as Party from "partykit/server";
import {Poll} from "@/app/types";

export function pollServerExtending(superclass: any) {
  return class PollServer extends superclass implements Party.Server {

    constructor(readonly room: Party.Party) {
      super()
    }

    private poll: Poll | undefined;

    async onRequest(req: Party.Request) {
      if (req.method === "POST") {
        const poll = (await req.json()) as Poll;
        this.poll = { ...poll, votes: poll.options.map(() => 0) };
        this.savePoll();
      }

      if (this.poll) {
        return new Response(JSON.stringify(this.poll), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }

      return new Response("Not found", { status: 404 });
    }

    async onMessage(message: string) {
      if (!this.poll) return;

      const event = JSON.parse(message);

      if (event.type === "vote") {
        this.poll.votes![event.data.option] += 1;
        this.room.broadcast(JSON.stringify({
          type: "votes",
          data: this.poll,
        }));
        this.savePoll();
      }
    }


    private async savePoll() {
      if (this.poll) {
        await this.room.storage.put<Poll>("poll", this.poll);
      }
    }

    async onStart() {
      this.poll = await this.room.storage.get<Poll>("poll");
    }
  }
}
