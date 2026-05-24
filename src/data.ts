import artistsData from "../public/data/music-artists.json";
import labelsData from "../public/data/record-labels.json";

import { MusicArtist, RecordLabel } from "./interfaces";

export const artists: MusicArtist[] = artistsData;
export const recordLabels: RecordLabel[] = labelsData;
