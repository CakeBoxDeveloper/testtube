export const ASSET_BASE = "/assets";

export const asset = (filename: string): string => `${ASSET_BASE}/${filename}`;

export const ICONS = {
  mse: asset("MSESVG.svg"),
  mseWhite: asset("MSESVGWhite.svg"),
  bioProfile: asset("BioProfile.svg"),
  attach: asset("attach.svg"),
  calculator: asset("calculator.svg"),
  chain: asset("chain.svg"),
  clockSoon: asset("clocksoon.svg"),
  collapse: asset("collapse.svg"),
  creditCard: asset("credit-card.svg"),
  customerService: asset("customer-service.svg"),
  dashboard: asset("dashboard.svg"),
  dayAndNight: asset("day-and-night.svg"),
  daylight: asset("daylight.svg"),
  defaultMaterial: asset("default_material.svg"),
  defaultWorkout: asset("default_workout.svg"),
  delete: asset("delete.svg"),
  door: asset("door.svg"),
  expand: asset("expand.svg"),
  idea: asset("idea.svg"),
  key: asset("key.svg"),
  mathematics: asset("mathematics.svg"),
  minimize: asset("minimize.svg"),
  moon: asset("moon.svg"),
  note: asset("note.svg"),
  padlock: asset("padlock.svg"),
  pin: asset("pin.svg"),
  puzzle: asset("puzzle.svg"),
  rate: asset("rate.svg"),
  rename: asset("rename.svg"),
  scale: asset("scale.svg"),
  send: asset("send.svg"),
} as const;

export const LOTTIE = {
  book: asset("Book.json"),
  dnatr: asset("DNATR.json"),
  loadHive: asset("Load HIVE.json"),
  loading: asset("Loading.json"),
  proxima: asset("Proxima.json"),
  progress: asset("DNATR.json"),
  lf30: asset("lf30_xz9lhzhx.json.json"),
  wNcrVcQABQ: asset("wNcrVcQABQ.json"),
} as const;

export const VIDEOS = {
  outline: {
    male: {
      heat: asset("OutlineHeatMale.webm"),
      xray: asset("OutlineXRayMale.webm"),
      grid: asset("OutlineGridMale.webm"),
    },
    female: {
      heat: asset("OutlineHeatFemale.webm"),
      xray: asset("OutlineXRayFemale.webm"),
      grid: asset("OutlineGridFamale.webm"),
    },
  },
} as const;
