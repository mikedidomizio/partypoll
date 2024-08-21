import {useOnMessage} from "@/providers/socket";

export function usePollMessage(type: 'votes', callbackFn: (event: { votes: number[]}) => any): void
export function usePollMessage<T>(type: 'votes', callbackFn: (event: T) => {}) {
  useOnMessage<T>((message) => callbackFn(message), ['votes'])
}
