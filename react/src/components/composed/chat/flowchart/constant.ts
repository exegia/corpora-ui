/* ── layout constants ── */
export const PAD_Y = 24;
export const ROW_GAP = 64;
export const PILL_OFFSET = 30; // kind pill + gap above a card

export const PURPLE = "#9a5cff";
export const AMBER = "#f09a2f";

/* estimated heights for the first paint; measured immediately after */
export const EST_H: Record<string, number> = { trigger: 92, cond: 134 };

export const PROPERTIES = ["flavor", "topping", "size", "scoops"];
export const FLAVORS = [
  { name: "Rocky Road", tag: "Classic" },
  { name: "Mint Chip", tag: "Classic" },
  { name: "Pistachio", tag: "Seasonal" },
  { name: "Bubblegum", tag: "Retro" },
];
export const TOPPINGS = [
  { name: "Brown butter bourbon brittle crunch" },
  { name: "Rainbow sprinkles" },
  { name: "Hot fudge" },
  { name: "Candied pecans" },
];