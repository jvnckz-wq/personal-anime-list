/**
 * The selection border shared by the title menu and the save slots on Continue and Load game:
 * a 4px border cut by a slanted clip, so it shows as long broken pieces, never a closed box.
 * CSS shows it when its parent is selected (`.m-item.on`, `.slot:focus`).
 */
export function CutFrame() {
  return <span className="cut-frame" aria-hidden="true" />;
}
