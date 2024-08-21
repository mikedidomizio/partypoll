import type * as Party from "partykit/server";
import {pollServerExtending} from "@/party/poll";

class DefaultServer implements Party.Server {
  async onRequest() {
    return new Response("Not found", { status: 404 });
  }
}

DefaultServer satisfies Party.Worker;

// order matters
// https://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/#bettermixinsthroughclassexpressions
export default pollServerExtending(DefaultServer)
