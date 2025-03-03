"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseChannelParser = void 0;
const common_1 = require("../../common");
class BaseChannelParser {
    static loadBaseChannel(target, data) {
        const { channelId, title, thumbnail, subscriberCountText } = data;
        target.id = channelId;
        target.name = title.simpleText;
        target.thumbnails = new common_1.Thumbnails().load(thumbnail.thumbnails);
        target.subscriberCount = subscriberCountText === null || subscriberCountText === void 0 ? void 0 : subscriberCountText.simpleText;
        return target;
    }
    /** Parse tab data from request, tab name is ignored if it's a continuation data */
    static parseTabData(name, data) {
        var _a, _b, _c, _d, _e, _f, _g;
        const tab = (_a = data.contents) === null || _a === void 0 ? void 0 : _a.twoColumnBrowseResultsRenderer.tabs.find((t) => {
            var _a;
            return (((_a = t.tabRenderer) === null || _a === void 0 ? void 0 : _a.endpoint.browseEndpoint.params) ===
                BaseChannelParser.TAB_TYPE_PARAMS[name]);
        });
        return (((_e = (_d = (_c = (_b = tab === null || tab === void 0 ? void 0 : tab.tabRenderer.content.sectionListRenderer) === null || _b === void 0 ? void 0 : _b.contents) === null || _c === void 0 ? void 0 : _c[0].itemSectionRenderer) === null || _d === void 0 ? void 0 : _d.contents[0].gridRenderer) === null || _e === void 0 ? void 0 : _e.items) || ((_f = tab === null || tab === void 0 ? void 0 : tab.tabRenderer.content.richGridRenderer) === null || _f === void 0 ? void 0 : _f.contents.map((c) => { var _a; return ((_a = c.richItemRenderer) === null || _a === void 0 ? void 0 : _a.content) || c; })) || ((_g = data.onResponseReceivedActions) === null || _g === void 0 ? void 0 : _g[0].appendContinuationItemsAction.continuationItems.map((c) => { var _a; return ((_a = c.richItemRenderer) === null || _a === void 0 ? void 0 : _a.content) || c; })) ||
            []);
    }
}
exports.BaseChannelParser = BaseChannelParser;
BaseChannelParser.TAB_TYPE_PARAMS = {
    videos: "EgZ2aWRlb3PyBgQKAjoA",
    shorts: "EgZzaG9ydHPyBgUKA5oBAA%3D%3D",
    live: "EgdzdHJlYW1z8gYECgJ6AA%3D%3D",
    playlists: "EglwbGF5bGlzdHPyBgQKAkIA",
};
