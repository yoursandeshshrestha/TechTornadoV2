import { Challenge } from "../types/index";
import leettable from "../../../../../public/round3question2.jpg";

export const challenges: Challenge[] = [
  {
    id: 1,
    title: "Encrypted Message",
    description:
      "A hacker has locked your system. The only way to escape is by deciphering their encrypted message. But be warned, each word has a different shift pattern.",
    encryptedMessage: "WKLV LV D WHVW",
    hints: [
      "Shift the first word back by 3.",
      "Shift the second word back by 3.",
      "Shift the third word back by 3.",
    ],
    answer: "",
  },
  {
    id: 2,
    title: "Leet Code Password",
    description:
      "A notorious hacker has locked you out of your system! The only way to regain access is by decoding their password written in 1337 (leet) language. But be warned, the hacker is tricky!",
    hints: [
      "The password follows a Word-Number-Word pattern.",
      "The first word is a ferocious animal (written in leet).",
      "The number in the middle is the year a famous hacking movie was released (1995 - Hackers).",
      "The last word is what a hacker loves the most - 'Access', written in leet!",
    ],
    answer: "",
    image: leettable,
  },
];

export const MAX_ATTEMPTS = 3;
export const DEFAULT_GAME_DURATION = 50 * 60; // 50 minutes in seconds
