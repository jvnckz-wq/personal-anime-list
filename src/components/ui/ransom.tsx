/** Integer hash, so a word cuts the same way on the server and in every browser. */
function rand(i: number, seed: number) {
  let h = Math.imul(i + 1, 0x9e3779b1) ^ Math.imul(seed + 7, 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d);
  h ^= h >>> 12;
  return ((h >>> 0) % 10000) / 10000;
}

/*
 * Three tiles, the mix the owner picked from LOAD GAME: paper with ink, ink with paper, red with an ink edge.
 * The weights keep every existing title (LOAD GAME included) cutting exactly as before.
 */
const TILES = ["tw", "tk", "tx", "tk", "tw", "tx", "tk"];
const CYCLE = ["tw", "tk", "tx"];

/**
 * Ransom-note lettering: each letter its own cut-out tile, in a mixed face, tilted.
 * No two neighbouring letters share a tile. Screen readers get the plain text once; the tiles are hidden from them.
 */
export function Ransom({ text, seed = 1, calm = false }: { text: string; seed?: number; calm?: boolean }) {
  let k = 0;
  let prev = "";
  return (
    <>
      <span className="sr-only">{text}</span>
      <span className="ransom" aria-hidden="true">
        {text.split(" ").map((word, w) => (
          <span className="w" key={w}>
            {[...word].map((ch) => {
              const i = k++;
              const r1 = rand(i, seed);
              const r2 = rand(i + 50, seed);
              const r3 = rand(i + 99, seed);
              let tile = i === 0 ? "tw" : TILES[Math.floor(r1 * TILES.length)];
              if (tile === prev) tile = CYCLE[(CYCLE.indexOf(tile) + 1 + Math.floor(r3 * 2)) % 3];
              prev = tile;
              const font = `f${1 + Math.floor(r2 * 5)}`;
              const style = {
                "--r": `${((r3 - 0.5) * (calm ? 10 : 16)).toFixed(1)}deg`,
                "--s": `${(calm ? 0.92 + r2 * 0.14 : 0.84 + r1 * 0.3).toFixed(2)}em`,
                "--y": `${((r2 - 0.5) * 10).toFixed(0)}%`,
                "--i": i,
              } as React.CSSProperties;
              return (
                <span key={i} className={`rl ${tile} ${font}`} style={style}>
                  {ch}
                </span>
              );
            })}
          </span>
        ))}
      </span>
    </>
  );
}
