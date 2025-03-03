"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseVideoParser = void 0;
const common_1 = require("../../common");
const BaseChannel_1 = require("../BaseChannel");
const PlaylistCompact_1 = require("../PlaylistCompact");
const VideoCompact_1 = require("../VideoCompact");
const VideoCaptions_1 = require("./VideoCaptions");
class BaseVideoParser {
    static loadBaseVideo(target, data) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        const videoInfo = BaseVideoParser.parseRawData(data);
        // console.log(JSON.stringify(videoInfo, null,  4));
        // Basic information
        target.id = ((_a = videoInfo.videoDetails) === null || _a === void 0 ? void 0 : _a.videoId) || ((_c = (_b = videoInfo.updatedMetadataEndpoint) === null || _b === void 0 ? void 0 : _b.updatedMetadataEndpoint) === null || _c === void 0 ? void 0 : _c.videoId) || JSON.stringify(data).match(/"videoId": "(.{11})"/);
        target.title = ((_d = videoInfo.videoDetails) === null || _d === void 0 ? void 0 : _d.title) || videoInfo.title.runs[0].text;
        target.uploadDate = videoInfo.dateText.simpleText;
        target.viewCount = +((_e = videoInfo.videoDetails) === null || _e === void 0 ? void 0 : _e.viewCount) || videoInfo.viewCount.videoViewCountRenderer.originalViewCount || null;
        target.isLiveContent = (_f = videoInfo.videoDetails) === null || _f === void 0 ? void 0 : _f.isLiveContent;
        target.thumbnails = videoInfo.videoDetails && new common_1.Thumbnails().load((_g = videoInfo.videoDetails) === null || _g === void 0 ? void 0 : _g.thumbnail.thumbnails);
        // Channel
        const { title, thumbnail, subscriberCountText } = videoInfo.owner.videoOwnerRenderer;
        target.channel = new BaseChannel_1.BaseChannel({
            client: target.client,
            id: title.runs[0].navigationEndpoint.browseEndpoint.browseId,
            name: title.runs[0].text,
            subscriberCount: subscriberCountText === null || subscriberCountText === void 0 ? void 0 : subscriberCountText.simpleText,
            thumbnails: new common_1.Thumbnails().load(thumbnail.thumbnails),
        });
        // Like Count and Dislike Count
        const topLevelButtons = videoInfo.videoActions.menuRenderer.topLevelButtons;
        target.likeCount = common_1.stripToInt(BaseVideoParser.parseButtonRenderer(topLevelButtons[0]));
        // Tags and description
        target.tags =
            ((_j = (_h = videoInfo.superTitleLink) === null || _h === void 0 ? void 0 : _h.runs) === null || _j === void 0 ? void 0 : _j.map((r) => r.text.trim()).filter((t) => t)) || [];
        target.description = ((_k = videoInfo.videoDetails) === null || _k === void 0 ? void 0 : _k.shortDescription) || videoInfo.attributedDescription.content || "";
        // related videos
        const secondaryContents = (_l = data.response.contents.twoColumnWatchNextResults.secondaryResults) === null || _l === void 0 ? void 0 : _l.secondaryResults.results;
        if (secondaryContents) {
            target.related.items = BaseVideoParser.parseRelatedFromSecondaryContent(secondaryContents, target.client);
            target.related.continuation = common_1.getContinuationFromItems(secondaryContents);
        }
        // captions
        if (videoInfo.captions) {
            target.captions = new VideoCaptions_1.VideoCaptions({ client: target.client, video: target }).load(videoInfo.captions.playerCaptionsTracklistRenderer);
        }
        return target;
    }
    static parseRelated(data, client) {
        const secondaryContents = data.onResponseReceivedEndpoints[0].appendContinuationItemsAction.continuationItems;
        return BaseVideoParser.parseRelatedFromSecondaryContent(secondaryContents, client);
    }
    static parseContinuation(data) {
        const secondaryContents = data.onResponseReceivedEndpoints[0].appendContinuationItemsAction.continuationItems;
        return common_1.getContinuationFromItems(secondaryContents);
    }
    static parseRawData(data) {
        const contents = data.response.contents.twoColumnWatchNextResults.results.results.contents;
        const primaryInfo = contents.find((c) => "videoPrimaryInfoRenderer" in c)
            .videoPrimaryInfoRenderer;
        const secondaryInfo = contents.find((c) => "videoSecondaryInfoRenderer" in c).videoSecondaryInfoRenderer;
        const { videoDetails, captions } = data.playerResponse;
        return Object.assign(Object.assign(Object.assign({}, secondaryInfo), primaryInfo), { videoDetails, captions });
    }
    static parseCompactRenderer(data, client) {
        if ("compactVideoRenderer" in data) {
            return new VideoCompact_1.VideoCompact({ client }).load(data.compactVideoRenderer);
        }
        else if ("compactRadioRenderer" in data) {
            return new PlaylistCompact_1.PlaylistCompact({ client }).load(data.compactRadioRenderer);
        }
    }
    static parseRelatedFromSecondaryContent(secondaryContents, client) {
        return secondaryContents
            .map((c) => BaseVideoParser.parseCompactRenderer(c, client))
            .filter((c) => c !== undefined);
    }
    static parseButtonRenderer(data) {
        var _a, _b;
        let likeCount;
        if (data.toggleButtonRenderer || data.buttonRenderer) {
            const buttonRenderer = data.toggleButtonRenderer || data.buttonRenderer;
            likeCount = (((_a = buttonRenderer.defaultText) === null || _a === void 0 ? void 0 : _a.accessibility) || buttonRenderer.accessibilityData).accessibilityData;
        }
        else if (data.segmentedLikeDislikeButtonRenderer) {
            const likeButton = data.segmentedLikeDislikeButtonRenderer.likeButton;
            const buttonRenderer = likeButton.toggleButtonRenderer || likeButton.buttonRenderer;
            likeCount = (((_b = buttonRenderer.defaultText) === null || _b === void 0 ? void 0 : _b.accessibility) || buttonRenderer.accessibilityData).accessibilityData;
        }
        else if (data.segmentedLikeDislikeButtonViewModel) {
            likeCount =
                data.segmentedLikeDislikeButtonViewModel.likeButtonViewModel.likeButtonViewModel
                    .toggleButtonViewModel.toggleButtonViewModel.defaultButtonViewModel
                    .buttonViewModel.accessibilityText;
        }
        return likeCount;
    }
}
exports.BaseVideoParser = BaseVideoParser;
