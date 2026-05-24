"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordLabels = exports.artists = void 0;
const music_artists_json_1 = __importDefault(require("../public/data/music-artists.json"));
const record_labels_json_1 = __importDefault(require("../public/data/record-labels.json"));
exports.artists = music_artists_json_1.default;
exports.recordLabels = record_labels_json_1.default;
