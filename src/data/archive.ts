export interface ArchivePhoto {
  src: string;
  srcset: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
  year: string;
}

export interface PreviewPhoto {
  src: string;
  width: number;
  height: number;
  scene: "Ванная" | "Переговорная";
  phase: "до уборки" | "после уборки";
  alt: string;
}

// Internal-only generated concepts. Never publish these as documentary work.
// Keep each before/after pair consecutive and separate from archivePhotos.
export const previewPhotos: PreviewPhoto[] = [
  {
    src: "/images/concepts/bathroom-before.png",
    width: 1448,
    height: 1086,
    scene: "Ванная",
    phase: "до уборки",
    alt: "Сгенерированный концепт ванной до уборки: следы загрязнения на раковине и в душевой",
  },
  {
    src: "/images/concepts/bathroom.png",
    width: 1448,
    height: 1086,
    scene: "Ванная",
    phase: "после уборки",
    alt: "Сгенерированный концепт той же ванной после уборки: светлая раковина и душевая",
  },
  {
    src: "/images/concepts/office-before.png",
    width: 1448,
    height: 1086,
    scene: "Переговорная",
    phase: "до уборки",
    alt: "Сгенерированный концепт переговорной до уборки: загрязнение на столе, полу и окне",
  },
  {
    src: "/images/concepts/office.png",
    width: 1448,
    height: 1086,
    scene: "Переговорная",
    phase: "после уборки",
    alt: "Сгенерированный концепт той же переговорной после уборки: чистый стол и пол",
  },
];

// Only approved photographs belong here. Add optimized sources and factual captions
// after privacy/publication review; never duplicate a photo to fill the gallery.
export const archivePhotos: ArchivePhoto[] = [
  {
    src: "/images/archive/tile-process-640.jpg",
    srcset: "/images/archive/tile-process-320.jpg 320w, /images/archive/tile-process-640.jpg 640w",
    width: 640,
    height: 480,
    alt: "Очистка плитки в техническом помещении, архивная фотография 2014 года",
    caption: "Очистка плитки в процессе",
    year: "2014",
  },
];
