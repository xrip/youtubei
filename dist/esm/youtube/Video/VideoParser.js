import { getContinuationFromItems, Thumbnails } from "../../common";
import { BaseVideoParser } from "../BaseVideo";
import { Comment } from "../Comment";
var VideoParser = /** @class */ (function () {
    function VideoParser() {
    }
    VideoParser.loadVideo = function (target, data) {
        var _a, _b, _c, _d;
        var videoInfo = BaseVideoParser.parseRawData(data);
        target.duration = +((_a = videoInfo.videoDetails) === null || _a === void 0 ? void 0 : _a.lengthSeconds);
        var itemSectionRenderer = (_b = data.response.contents.twoColumnWatchNextResults.results.results.contents
            .reverse()
            .find(function (c) { return c.itemSectionRenderer; })) === null || _b === void 0 ? void 0 : _b.itemSectionRenderer;
        target.comments.continuation = getContinuationFromItems((itemSectionRenderer === null || itemSectionRenderer === void 0 ? void 0 : itemSectionRenderer.contents) || []);
        var chapters = (_d = (_c = data.response.playerOverlays.playerOverlayRenderer.decoratedPlayerBarRenderer) === null || _c === void 0 ? void 0 : _c.decoratedPlayerBarRenderer.playerBar.multiMarkersPlayerBarRenderer.markersMap) === null || _d === void 0 ? void 0 : _d[0].value.chapters;
        target.chapters =
            (chapters === null || chapters === void 0 ? void 0 : chapters.map(function (_a) {
                var c = _a.chapterRenderer;
                return ({
                    title: c.title.simpleText,
                    start: c.timeRangeStartMillis,
                    thumbnails: new Thumbnails().load(c.thumbnail.thumbnails),
                });
            })) || [];
        return target;
    };
    VideoParser.parseComments = function (data, video) {
        var comments = data.frameworkUpdates.entityBatchUpdate.mutations
            .filter(function (m) { return m.payload.commentEntityPayload; })
            .map(function (m) { return m.payload.commentEntityPayload; });
        return comments.map(function (c) {
            return new Comment({ video: video, client: video.client }).load(c);
        });
    };
    VideoParser.parseCommentContinuation = function (data) {
        var endpoints = data.onResponseReceivedEndpoints.at(-1);
        var continuationItems = (endpoints.reloadContinuationItemsCommand || endpoints.appendContinuationItemsAction).continuationItems;
        return getContinuationFromItems(continuationItems);
    };
    return VideoParser;
}());
export { VideoParser };
