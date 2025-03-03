var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { Base } from "../Base";
import { Caption, CaptionLanguage } from "../Caption";
/**
 * Captions of a video
 *
 * @example
 * ```js
 *
 * console.log(video.captions.languages.map((l) => `${l.code} - ${l.name}`)); // printing out available languages for captions
 *
 * console.log(await video.captions.get("en")); // printing out captions of a specific language using language code
 * ```
 */
var VideoCaptions = /** @class */ (function (_super) {
    __extends(VideoCaptions, _super);
    /** @hidden */
    function VideoCaptions(_a) {
        var video = _a.video, client = _a.client;
        var _this = _super.call(this, client) || this;
        _this.video = video;
        _this.languages = [];
        return _this;
    }
    /**
     * Load this instance with raw data from Youtube
     *
     * @hidden
     */
    VideoCaptions.prototype.load = function (data) {
        var _this = this;
        var captionTracks = data.captionTracks;
        if (captionTracks) {
            this.languages = captionTracks.map(function (track) {
                return new CaptionLanguage({
                    captions: _this,
                    name: track.name.simpleText,
                    code: track.languageCode,
                    isTranslatable: !!track.isTranslatable,
                    url: track.baseUrl,
                });
            });
        }
        return this;
    };
    /**
     * Get captions of a specific language or a translation of a specific language
     */
    VideoCaptions.prototype.get = function (languageCode, translationLanguageCode) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var url, params, response, captions;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!languageCode)
                            languageCode = this.client.options.youtubeClientOptions.hl;
                        url = (_a = this.languages.find(function (l) { return l.code.toUpperCase() === (languageCode === null || languageCode === void 0 ? void 0 : languageCode.toUpperCase()); })) === null || _a === void 0 ? void 0 : _a.url;
                        if (!url)
                            return [2 /*return*/, undefined];
                        params = { fmt: "json3" };
                        if (translationLanguageCode)
                            params["tlang"] = translationLanguageCode;
                        return [4 /*yield*/, this.client.http.get(url, { params: params })];
                    case 1:
                        response = _c.sent();
                        captions = (_b = response.data.events) === null || _b === void 0 ? void 0 : _b.reduce(function (curr, e) {
                            var _a;
                            if (e.segs === undefined)
                                return curr;
                            curr.push(new Caption({
                                duration: e.dDurationMs,
                                start: e.tStartMs,
                                text: (_a = e.segs) === null || _a === void 0 ? void 0 : _a.map(function (s) { return s.utf8; }).join(),
                                segments: e.segs,
                            }));
                            return curr;
                        }, []);
                        return [2 /*return*/, captions];
                }
            });
        });
    };
    return VideoCaptions;
}(Base));
export { VideoCaptions };
