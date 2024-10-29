"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoParser = void 0;
const common_1 = require("../../common");
const BaseVideo_1 = require("../BaseVideo");
const Comment_1 = require("../Comment");
class VideoParser {
    static loadVideo(target, data) {
        var _a, _b, _c, _d;
        const videoInfo = BaseVideo_1.BaseVideoParser.parseRawData(data);
        target.duration = +((_a = videoInfo.videoDetails) === null || _a === void 0 ? void 0 : _a.lengthSeconds);
        const itemSectionRenderer = (_b = data.response.contents.twoColumnWatchNextResults.results.results.contents
            .reverse()
            .find((c) => c.itemSectionRenderer)) === null || _b === void 0 ? void 0 : _b.itemSectionRenderer;
        target.comments.continuation = common_1.getContinuationFromItems((itemSectionRenderer === null || itemSectionRenderer === void 0 ? void 0 : itemSectionRenderer.contents) || []);
        const chapters = (_d = (_c = data.response.playerOverlays.playerOverlayRenderer.decoratedPlayerBarRenderer) === null || _c === void 0 ? void 0 : _c.decoratedPlayerBarRenderer.playerBar.multiMarkersPlayerBarRenderer.markersMap) === null || _d === void 0 ? void 0 : _d[0].value.chapters;
        target.chapters =
            (chapters === null || chapters === void 0 ? void 0 : chapters.map(({ chapterRenderer: c }) => ({
                title: c.title.simpleText,
                start: c.timeRangeStartMillis,
                thumbnails: new common_1.Thumbnails().load(c.thumbnail.thumbnails),
            }))) || [];
        return target;
    }
    static parseComments(data, video) {
        const comments = data.frameworkUpdates.entityBatchUpdate.mutations
            .filter((m) => m.payload.commentEntityPayload)
            .map((m) => m.payload.commentEntityPayload);
        return comments.map((c) => new Comment_1.Comment({ video, client: video.client }).load(c));
    }
    static parseCommentContinuation(data) {
        const endpoints = data.onResponseReceivedEndpoints.at(-1);
        const continuationItems = (endpoints.reloadContinuationItemsCommand || endpoints.appendContinuationItemsAction).continuationItems;
        return common_1.getContinuationFromItems(continuationItems);
    }
}
exports.VideoParser = VideoParser;
