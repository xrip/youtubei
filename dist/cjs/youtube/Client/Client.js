"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const common_1 = require("../../common");
const Channel_1 = require("../Channel");
const LiveVideo_1 = require("../LiveVideo");
const MixPlaylist_1 = require("../MixPlaylist");
const Playlist_1 = require("../Playlist");
const SearchResult_1 = require("../SearchResult");
const Video_1 = require("../Video");
const constants_1 = require("../constants");
/** Youtube Client */
class Client {
    constructor(options = {}) {
        this.options = Object.assign(Object.assign({ initialCookie: "", fetchOptions: {} }, options), { youtubeClientOptions: Object.assign({ hl: "en", gl: "US" }, options.youtubeClientOptions) });
        this.http = new common_1.HTTP(Object.assign({ apiKey: constants_1.INNERTUBE_API_KEY, baseUrl: constants_1.BASE_URL, clientName: constants_1.INNERTUBE_CLIENT_NAME, clientVersion: constants_1.INNERTUBE_CLIENT_VERSION }, this.options));
    }
    /**
     * Searches for videos / playlists / channels
     *
     * @param query The search query
     * @param options Search options
     *
     */
    search(query, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = new SearchResult_1.SearchResult({ client: this });
            yield result.search(query, options || {});
            return result;
        });
    }
    /**
     * Search for videos / playlists / channels and returns the first result
     *
     * @return Can be {@link VideoCompact} | {@link PlaylistCompact} | {@link BaseChannel} | `undefined`
     */
    findOne(query, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.search(query, options);
            return result.items[0] || undefined;
        });
    }
    /** Get playlist information and its videos by playlist id or URL */
    getPlaylist(playlistId) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            if (playlistId.startsWith("RD")) {
                const response = yield this.http.post(`${constants_1.I_END_POINT}/next`, {
                    data: { playlistId },
                });
                if (response.data.error) {
                    return undefined;
                }
                return new MixPlaylist_1.MixPlaylist({ client: this }).load(response.data);
            }
            const response = yield this.http.post(`${constants_1.I_END_POINT}/browse`, {
                data: { browseId: `VL${playlistId}` },
            });
            if (response.data.error || ((_c = (_b = (_a = response.data.alerts) === null || _a === void 0 ? void 0 : _a.shift()) === null || _b === void 0 ? void 0 : _b.alertRenderer) === null || _c === void 0 ? void 0 : _c.type) === "ERROR") {
                return undefined;
            }
            return new Playlist_1.Playlist({ client: this }).load(response.data);
        });
    }
    /** Get video information by video id or URL */
    getVideo(videoId) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.http.get(`${constants_1.WATCH_END_POINT}`, {
                params: { v: videoId, pbj: "1" },
            });
            const data = Array.isArray(response.data)
                ? response.data.reduce((prev, curr) => (Object.assign(Object.assign({}, prev), curr)), {})
                : response.data;
            if (!((_b = (_a = data.response) === null || _a === void 0 ? void 0 : _a.contents) === null || _b === void 0 ? void 0 : _b.twoColumnWatchNextResults.results.results.contents) ||
                data.playerResponse.playabilityStatus.status === "ERROR") {
                return undefined;
            }
            return (!data.playerResponse.playabilityStatus.liveStreamability
                ? new Video_1.Video({ client: this }).load(data)
                : new LiveVideo_1.LiveVideo({ client: this }).load(data));
        });
    }
    /** Get channel information by channel id+ */
    getChannel(channelId) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.http.post(`${constants_1.I_END_POINT}/browse`, {
                data: { browseId: channelId },
            });
            if (response.data.error || ((_c = (_b = (_a = response.data.alerts) === null || _a === void 0 ? void 0 : _a.shift()) === null || _b === void 0 ? void 0 : _b.alertRenderer) === null || _c === void 0 ? void 0 : _c.type) === "ERROR") {
                return undefined;
            }
            return new Channel_1.Channel({ client: this }).load(response.data);
        });
    }
    /**
     * Get video transcript / caption by video id
     */
    getVideoTranscript(videoId, languageCode) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const video = yield this.getVideo(videoId);
            return (_a = video === null || video === void 0 ? void 0 : video.captions) === null || _a === void 0 ? void 0 : _a.get(languageCode);
        });
    }
}
exports.Client = Client;
