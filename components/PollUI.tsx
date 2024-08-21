"use client";

import { useEffect, useState } from "react";
import PollOptions from "./PollOptions";
import {SocketProvider, useOnClose, useOnMessage, useOnOpen, useSocket} from "@/providers/socket";
import {usePollMessage} from "@/hooks/poll";

export default function PollUISocketWrapper({
  id,
  options,
  initialVotes,
}: {
  id: string;
  options: string[];
  initialVotes?: number[];
}) {
  return <SocketProvider roomId={id}>
    <PollUI id={id} options={options} initialVotes={initialVotes} />
  </SocketProvider>
}

function PollUI({
  id,
  options,
  initialVotes,
}: {
  id: string;
  options: string[];
  initialVotes?: number[];
}) {
  const {sendJSON} = useSocket()
  const [votes, setVotes] = useState<number[]>(initialVotes ?? []);
  const [vote, setVote] = useState<number | null>(null);

  useOnMessage<{ votes: number[]}>((message) => {
    console.log('useOnMessage', message.votes)
    setVotes(message.votes)
  }, ['votes'])

  usePollMessage('votes', (message) => {
    console.log('usePollMessage', message.votes)
  })

  useOnClose((e) => {
    console.log('useOnClose fired', e)
  })

  useOnOpen((e) => {
    console.log('useOnOpen fired', e)
  })

  const sendVote = (option: number) => {
    if (vote === null) {
      // no need to JSON.stringify
      sendJSON({ type: "vote", data: {
          option
        }
      });
      setVote(option);
    }
  };

  // prevent double voting
  useEffect(() => {
    let saved = localStorage?.getItem("poll:" + id);
    if (vote === null && saved !== null) {
      setVote(+saved);
    } else if (vote !== null && saved === null) {
      localStorage?.setItem("poll:" + id, `${vote}`);
    }
  }, [id, vote]);

  return (
    <PollOptions
      options={options}
      votes={votes}
      vote={vote}
      setVote={sendVote}
    />
  );
}
