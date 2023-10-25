"use client";

import { useRef, useState } from "react";
import Button from "./Button";
import Input from "./Input";

export default function PollMaker() {
  const [newOption, setNewOption] = useState<string>("");
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const newOptionRef = useRef<HTMLInputElement>(null);
  const addNewOption = () => {
    if (newOption?.trim().length !== 0) {
      setOptions((prevOptions) => [...prevOptions, newOption]);
      setNewOption("");
    }
  };

  const canSubmit =
    title.length > 0 &&
    options.length >= 2 &&
    options.filter((option) => option.trim().length === 0).length === 0;

  return (
    <>
      <Input
        placeholder="Poll title"
        type="text"
        name="title"
        className={"text-2xl font-bold"}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            newOptionRef.current?.focus();
          }
        }}
      />
      <ul className="flex flex-col space-y-4">
        {options.map((value, i) => (
          <li className="flex" key={i}>
            <Input type="text" name={`option-${i}`} defaultValue={value} />
          </li>
        ))}
        <li className="flex space-x-4">
          <Input
            ref={newOptionRef}
            type="text"
            placeholder="New option"
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (newOption.length > 0) {
                  addNewOption();
                }
              }
            }}
          />
          <Button theme="light" onClick={addNewOption}>
            Add
          </Button>
        </li>
      </ul>
      <Button type="submit" disabled={!canSubmit}>
        Create poll
      </Button>
    </>
  );
}
