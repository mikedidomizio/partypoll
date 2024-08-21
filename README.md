# PartyPoll /w React Context Provider

This is built based on the completed [PartyKit PartyPoll example](https://github.com/partykit/partypoll/), and uses React Context Provider to received data
by React hooks.

## Provider

The [SocketProvider](./providers/socket.tsx) is what connects to the socket and handles the connection.
Its job is to have a separation between components and the socket.  All interactions or changes are to be handled by it.

On top of that, the provider provides handler method(s):

- `sendJSON` which will handle parsing JSON between React and the Websocket server.

### Provider Hooks

as well as React hooks to handle WebSocket events:

- [useOnOpen](./providers/socket.tsx#L40) hook will fire once if the connection disconnects, then reconnects.
- [useOnClose](./providers/socket.tsx#L90) hook will fire once if the connection disconnects.
- [useOnMessage](./providers/socket.tsx#L129) hook can tap into certain message types. The idea is to be able to have separate
  hooks.

with `useOnMessage` instead of handling the message events with `onMessage` like so

```tsx
const socket = usePartySocket({
  host: PARTYKIT_HOST,
  room: id,
  onMessage(event) {
    const message = JSON.parse(event.data) as Poll;
    if (message.votes) {
      setVotes(message.votes);
    }
    
    if (message.somethingElse) {
      // do something else
    }
  },
});
```

you would just handle it with hooks

```tsx
  useOnMessage<{ votes: number[]}>((message) => {
    // fires when a vote
    setVotes(message.votes)
  }, ['votes'])
  
  useOnMessage((message) => {
    // fires when somethingElse message type is sent
  }, ['somethingElse'])
```

The response from the server being changed to now have `data` and `type` to be specific what you're targeting.

This allows you to have separate hooks if wanted, breaking up when each one will fire.

## Hooks

Hooks _could_ also be built on top of `useOnMessage` to provide an abstraction of return typedefs
with function overloading. This could help provide guidance if hook access
is necessary in many components with intellisense. For demo purposes, this has been done with
[usePollMessage](./hooks/poll.ts).

## Potentially other providers

Providers _could_ also be built on top of `SocketProvider` as a sort of middleware to further
handle the specific message types and have its own logic.

## Websocket party setup

This demo separates the party server logic into separate files.

### Pros

- Separates the code into modules
  - making it easier to read, easier to add, update and remove entire pieces. 

### Cons

- Higher chance of overlapping message type conflicts. It has to be handled a bit more carefully.
- Order matters, this could also be a pro as you can easily change the order, and it's not really different compared to having it in one file.
- If you forget to call the `super.*` methods it ends up not continuing through the chain. Easier to make a mistake.


