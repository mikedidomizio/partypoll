import * as React from 'react'
import {PropsWithChildren, useCallback, useEffect, useRef, useState} from "react";
import usePartySocket from "partysocket/react";
import {PARTYKIT_HOST} from "@/app/env";
import PartySocket from "partysocket";

type Socket = {
  sendJSON: (jsonObj: object) => void
  socket: PartySocket
}

export const SocketContext = React.createContext<Socket | undefined>(undefined)

export function SocketProvider({ children, roomId }: PropsWithChildren<{ roomId: string }>) {
  const socket = usePartySocket({
    host: PARTYKIT_HOST,
    room: roomId,
  });

  const sendJSON = (jsonObj: object) => socket.send(JSON.stringify(jsonObj))

  const value = {
    sendJSON,
    socket
  }
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

function useSocketContext() {
  const context = React.useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }

  return context
}

// fires when a disconnect has happened a reconnect has occurred
// complex so that it does not fire on component mount
export function useOnOpen(callbackFn: (event: Event) => void) {
  const { socket } = useSocketContext()
  const [isDisconnected, setIsDisconnected] = useState(false)
  const [hasDisconnected, setHasDisconnected] = useState(false)
  const [hasOpened, setHasOpened] = useState(false)
  const [eventData, setEventData] = useState<Event | null>(null)

  const callbackFnToHandleOnOpen = useCallback((ev: Event) => {
    setIsDisconnected(false)
    callbackFn(ev)
    setHasOpened(true)
  }, [callbackFn])

  useEffect(() => {
    const onDisconnect = () => {
      setIsDisconnected(true)
      setHasDisconnected(true)
    }

    socket.addEventListener('close', onDisconnect)

    return () => {
      socket.removeEventListener('close', onDisconnect)
    }
  }, [socket, socket.readyState])

  useEffect(() => {
    const onOpenCallbackFn = (ev: Event) => {
      setHasOpened(true)
      setIsDisconnected(false)
      setEventData(ev)
    }

    socket.addEventListener('open', onOpenCallbackFn)

    return () => {
      socket.removeEventListener('open', onOpenCallbackFn)
    }
  }, [socket, socket.readyState])

  useEffect(() => {
    if (!isDisconnected && hasOpened && hasDisconnected && eventData) {
      callbackFnToHandleOnOpen(eventData)
      setEventData(null)
    }
  }, [isDisconnected, hasOpened, hasDisconnected, callbackFnToHandleOnOpen, eventData])
}

// fires when a disconnect has happened
// complex so that it does not continuously fire after closed
export function useOnClose(callbackFn: (event: Event) => void) {
  const { socket } = useSocketContext()
  const [hasFiredClosedEvent, setHasFiredClosedEvent] = useState(false)
  const [hasClosed, setHasClosed] = useState(false)
  const [eventData, setEventData] = useState<Event | null>(null)

  const callbackFnToHandleOnClosed = useCallback((ev: Event) => {
    setHasClosed(false)
    callbackFn(ev)
  }, [callbackFn])

  useEffect(() => {
    if (socket.readyState !== socket.CLOSED) {
      setHasFiredClosedEvent(false)
    }

    if (socket.readyState === socket.CLOSED) {
      setHasClosed(true)
    }
  }, [socket.CLOSED, socket.readyState])

  useEffect(() => {
    const onCloseCallbackFn = (ev: Event) => setEventData(ev)

    socket.addEventListener("close", onCloseCallbackFn)

    return () => {
      socket.removeEventListener("close", onCloseCallbackFn)
    }
  }, [callbackFn, hasFiredClosedEvent, socket])

  useEffect(() => {
    if (hasClosed && !hasFiredClosedEvent && eventData) {
      callbackFnToHandleOnClosed(eventData)
      setEventData(null)
    }
  }, [callbackFnToHandleOnClosed, eventData, hasClosed, hasFiredClosedEvent])
}

export function useOnMessage<T>(callbackFn: (event: T) => void, messageTypes: string[]) {
  const { socket } = useSocketContext()
  const hasMounted =  useRef(false)

  useEffect(() => {
    if (!socket) {
      return
    }

    const eventListener = (event: MessageEvent) => {
      const json = JSON.parse(event.data)

      if (messageTypes.includes(json.type)) {
        callbackFn(json.data)
      }
    }

    if (!hasMounted.current) {
      hasMounted.current = true
      socket.addEventListener("message", eventListener)
    }

    return () => {
      if (hasMounted.current) {
        hasMounted.current = false
        socket.removeEventListener("message", eventListener)
      }
    }
  }, [callbackFn, messageTypes, socket])
}

export function useSocket() {
  const { sendJSON } = useSocketContext()

  return {
    sendJSON,
  };
}
