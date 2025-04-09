import { Challenge } from "../types/index";
import leettable from "../../../../../public/round3question2.png";

export const challenges: Challenge[] = [
  {
    id: 1,
    title: "Escape the Trap – Final Protocol",
    description:
      "The final chamber is sealed. An encrypted message flashes on the control screen. You have three attempts to decrypt it and unlock the emergency override. Fail — and the trap remains closed forever.",
    encryptedMessage: "BRX KDYH HVFDSHG WKH WRUQDGR",
    hints: [
      "The message feels... off, as if it’s been pushed a few steps ahead of where it should be.",
      "What moves forward can move back to its rightful place.",
      "Short words might hide something familiar, look for shapes you recognize.",
      "There’s a storm at the end of the message. Maybe you've seen its name before.",
      "This is no random jumble, every letter obeys the same hidden rule.",
      "The answer may contain spaces, and lowercase might suit it better.",
      "Clarity awaits those who see the pattern.",
    ],
    answer: "YOU HAVE ESCAPED THE TORNADO",
  },
  {
    id: 2,
    title: "Leet Code Password",
    description:
      "A malicious program that hides in plain sight. Combine it with the year reality was questioned — but in reverse. End it with what every rogue AI desires. Decode the 1337 to find the key.\n\nAnswer Format: Word-Number-Word (All characters in leet speak)",
    hints: [
      "The first word is a malicious program that hides in plain sight.",
      "The number is the year reality was questioned (The Matrix - 1999), but in reverse.",
      "The last word is what every rogue AI desires.",
      "Check the leet (1337) table for translations.",
    ],
    answer: "7|0_4|9991(0|7|0|",
    image: leettable,
  },
];

export const MAX_ATTEMPTS = 3;
export const DEFAULT_GAME_DURATION = 50 * 60; // 50 minutes in seconds
