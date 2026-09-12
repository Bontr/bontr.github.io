export const SCENE_TIMELINE = {
  flowerExit: { start: 0.18, end: 0.4 },
  landscapeExit: { start: 0.24, end: 0.43 },
  fieldSettle: { desktopStart: 0.7, mobileStart: 0.66, end: 1 },
} as const;

export const getFieldSettleStart = (mobile: boolean) =>
  mobile ? SCENE_TIMELINE.fieldSettle.mobileStart : SCENE_TIMELINE.fieldSettle.desktopStart;
