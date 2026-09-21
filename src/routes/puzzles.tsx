import { createFileRoute } from "@tanstack/react-router";
import { Lightbulb, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ActivityShell } from "@/components/pace/ActivityShell";
import { useActivityActions } from "@/lib/pace-activity";
import gardenPicture from "@/assets/puzzle-garden.jpg";

export const Route = createFileRoute("/puzzles")({
  head: () => ({
    meta: [
      { title: "Puzzles and games — PACE" },
      { name: "description", content: "Big, gentle puzzles with no timers and no scores." },
      { property: "og:title", content: "Puzzles and games — PACE" },
      { property: "og:description", content: "A jigsaw, a matching game and a word game, made large and simple." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Puzzles,
});

type GameKey = "jigsaw" | "pairs" | "word";

const GAMES: { key: GameKey; label: string; detail: string }[] = [
  { key: "jigsaw", label: "Picture puzzle", detail: "Put a garden picture back together" },
  { key: "pairs", label: "Matching pairs", detail: "Find the pairs that go together" },
  { key: "word", label: "Word game", detail: "Unscramble a friendly word" },
];

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap]!, copy[index]!];
  }
  return copy;
}

function Puzzles() {
  const [game, setGame] = useState<GameKey>("jigsaw");
  const { status, announce, doHere } = useActivityActions("Puzzles and games");

  return (
    <ActivityShell
      activity="Puzzles and games"
      eyebrow="Explore"
      title="Puzzles and games"
      lead="No timers and no scores. Play for as long as you like."
      status={status}
    >
      <div className="activity-actions" role="group" aria-label="Choose a game">
        {GAMES.map((item) => (
          <Button
            key={item.key}
            size="xl"
            variant={game === item.key ? "default" : "outline"}
            aria-pressed={game === item.key}
            onClick={() => {
              setGame(item.key);
              announce(`${item.label}. ${item.detail}.`);
            }}
          >
            <span>
              <strong>{item.label}</strong>
              <small>{item.detail}</small>
            </span>
          </Button>
        ))}
      </div>

      {game === "jigsaw" && <Jigsaw announce={announce} doHere={doHere} />}
      {game === "pairs" && <Pairs announce={announce} doHere={doHere} />}
      {game === "word" && <WordGame announce={announce} doHere={doHere} />}
    </ActivityShell>
  );
}

type GameProps = { announce: (text: string) => void; doHere: (label: string, spoken: string) => void };

function Jigsaw({ announce, doHere }: GameProps) {
  const size = 3; // 9 large pieces
  const total = size * size;
  const solved = Array.from({ length: total }, (_, index) => index);
  const [pieces, setPieces] = useState<number[]>(() => shuffle(solved));
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const check = useCallback(
    (next: number[]) => {
      if (next.every((value, index) => value === index)) {
        setDone(true);
        doHere("Finished the picture puzzle", "Wonderful. You finished the garden picture.");
      }
    },
    [doHere],
  );

  const tap = (slot: number) => {
    if (done) return;
    if (picked === null) {
      setPicked(slot);
      announce("Now tap where this piece should go.");
      return;
    }
    const next = [...pieces];
    [next[picked], next[slot]] = [next[slot]!, next[picked]!];
    setPicked(null);
    setPieces(next);
    check(next);
  };

  const hint = () => {
    const wrong = pieces.findIndex((value, index) => value !== index);
    if (wrong === -1) return;
    const holder = pieces.indexOf(wrong);
    const next = [...pieces];
    [next[wrong], next[holder]] = [next[holder]!, next[wrong]!];
    setPieces(next);
    setPicked(null);
    announce("Here is one piece in its place.");
    check(next);
  };

  return (
    <section className="game-panel">
      <div className="jigsaw-board" role="group" aria-label="Picture puzzle pieces">
        {pieces.map((piece, slot) => (
          <button
            key={slot}
            type="button"
            className={`jigsaw-piece${picked === slot ? " is-picked" : ""}`}
            aria-label={`Puzzle piece ${piece + 1}`}
            onClick={() => tap(slot)}
            style={{
              backgroundImage: `url(${gardenPicture})`,
              backgroundSize: `${size * 100}% ${size * 100}%`,
              backgroundPosition: `${(piece % size) * (100 / (size - 1))}% ${Math.floor(piece / size) * (100 / (size - 1))}%`,
            }}
          />
        ))}
      </div>
      {done && <p className="celebration">🎉 Beautiful work. The garden is back together.</p>}
      <div className="activity-actions">
        <Button size="xl" variant="outline" onClick={hint} disabled={done}>
          <Lightbulb aria-hidden />
          Hint
        </Button>
        <Button
          size="xl"
          variant="outline"
          onClick={() => {
            setPieces(shuffle(solved));
            setPicked(null);
            setDone(false);
            announce("A fresh puzzle.");
          }}
        >
          <RotateCcw aria-hidden />
          Start again
        </Button>
      </div>
    </section>
  );
}

const PAIR_FACES = ["🌻", "🐦", "🍎", "☕"];

function Pairs({ announce, doHere }: GameProps) {
  const [cards, setCards] = useState(() => shuffle([...PAIR_FACES, ...PAIR_FACES]));
  const [open, setOpen] = useState<number[]>([]);
  const [found, setFound] = useState<string[]>([]);

  useEffect(() => {
    if (open.length !== 2) return;
    const [first, second] = open;
    const timer = window.setTimeout(() => {
      if (cards[first!] === cards[second!]) {
        setFound((all) => [...all, cards[first!]!]);
        announce("That's a pair.");
      }
      setOpen([]);
    }, 900);
    return () => window.clearTimeout(timer);
  }, [open, cards, announce]);

  useEffect(() => {
    if (found.length === PAIR_FACES.length) doHere("Finished matching pairs", "Lovely. You found every pair.");
  }, [found, doHere]);

  const flip = (index: number) => {
    if (open.length === 2 || open.includes(index) || found.includes(cards[index]!)) return;
    setOpen([...open, index]);
  };

  return (
    <section className="game-panel">
      <div className="pairs-board" role="group" aria-label="Matching pairs">
        {cards.map((face, index) => {
          const showing = open.includes(index) || found.includes(face);
          return (
            <button
              key={index}
              type="button"
              className={`pair-card${showing ? " is-open" : ""}`}
              onClick={() => flip(index)}
              aria-label={showing ? `Card showing ${face}` : "Hidden card"}
            >
              {showing ? face : "?"}
            </button>
          );
        })}
      </div>
      {found.length === PAIR_FACES.length && <p className="celebration">🎉 You found them all.</p>}
      <div className="activity-actions">
        <Button
          size="xl"
          variant="outline"
          onClick={() => {
            const missing = PAIR_FACES.find((face) => !found.includes(face));
            if (!missing) return;
            const spots = cards.map((face, index) => (face === missing ? index : -1)).filter((index) => index >= 0);
            setOpen(spots.slice(0, 2));
            announce(`Look for the ${missing === "🌻" ? "sunflower" : missing === "🐦" ? "bird" : missing === "🍎" ? "apple" : "cup of coffee"}.`);
          }}
        >
          <Lightbulb aria-hidden />
          Hint
        </Button>
        <Button
          size="xl"
          variant="outline"
          onClick={() => {
            setCards(shuffle([...PAIR_FACES, ...PAIR_FACES]));
            setFound([]);
            setOpen([]);
            announce("A fresh game.");
          }}
        >
          <RotateCcw aria-hidden />
          Start again
        </Button>
      </div>
    </section>
  );
}

const WORDS = ["GARDEN", "FAMILY", "SUNDAY", "COFFEE", "FLOWER", "MUSIC"];

function WordGame({ announce, doHere }: GameProps) {
  const [word, setWord] = useState(() => WORDS[Math.floor(Math.random() * WORDS.length)]!);
  const [letters, setLetters] = useState(() => shuffle(word.split("")));
  const [guess, setGuess] = useState<string[]>([]);
  const answer = guess.join("");
  const correct = answer === word;

  useEffect(() => {
    if (correct) doHere("Finished the word game", `That's right. The word is ${word.toLowerCase()}.`);
  }, [correct, word, doHere]);

  const fresh = () => {
    const next = WORDS[Math.floor(Math.random() * WORDS.length)]!;
    setWord(next);
    setLetters(shuffle(next.split("")));
    setGuess([]);
    announce("A new word.");
  };

  return (
    <section className="game-panel">
      <p className="word-answer" aria-live="polite">
        {guess.length ? answer : "Tap the letters to spell a word."}
      </p>
      <div className="word-letters" role="group" aria-label="Letters">
        {letters.map((letter, index) => (
          <button
            key={`${letter}-${index}`}
            type="button"
            className="letter-tile"
            onClick={() => {
              setGuess([...guess, letter]);
              setLetters(letters.filter((_, position) => position !== index));
            }}
          >
            {letter}
          </button>
        ))}
      </div>
      {correct && <p className="celebration">🎉 That's it — {word.toLowerCase()}.</p>}
      <div className="activity-actions">
        <Button
          size="xl"
          variant="outline"
          onClick={() => announce(`The word starts with ${word[0]} and has ${word.length} letters.`)}
        >
          <Lightbulb aria-hidden />
          Hint
        </Button>
        <Button
          size="xl"
          variant="outline"
          onClick={() => {
            setLetters(shuffle(word.split("")));
            setGuess([]);
            announce("Letters put back.");
          }}
        >
          Clear letters
        </Button>
        <Button size="xl" variant="outline" onClick={fresh}>
          <RotateCcw aria-hidden />
          New word
        </Button>
      </div>
    </section>
  );
}
