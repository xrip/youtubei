import { getContinuationFromItems, stripToInt, Thumbnails, YoutubeRawData } from "../../common";
import { BaseChannel } from "../BaseChannel";
import { Client } from "../Client";
import { PlaylistCompact } from "../PlaylistCompact";
import { VideoCompact } from "../VideoCompact";
import { BaseVideo } from "./BaseVideo";
import { VideoCaptions } from "./VideoCaptions";

export class BaseVideoParser {
	static loadBaseVideo(target: BaseVideo, data: YoutubeRawData): BaseVideo {
		const videoInfo = BaseVideoParser.parseRawData(data);

		// console.log(JSON.stringify(videoInfo, null,  4));
		// Basic information
		target.id = videoInfo.videoDetails?.videoId || videoInfo.updatedMetadataEndpoint?.updatedMetadataEndpoint?.videoId || JSON.stringify(data).match(/"videoId": "(.{11})"/);
		target.title = videoInfo.videoDetails?.title || videoInfo.title.runs[0].text;
		target.uploadDate = videoInfo.dateText.simpleText;
		target.viewCount = +videoInfo.videoDetails?.viewCount || videoInfo.viewCount.videoViewCountRenderer.originalViewCount || null;
		target.isLiveContent = videoInfo.videoDetails?.isLiveContent;
		target.thumbnails = videoInfo.videoDetails && new Thumbnails().load(videoInfo.videoDetails?.thumbnail.thumbnails);

		// Channel
		const { title, thumbnail, subscriberCountText } = videoInfo.owner.videoOwnerRenderer;

		target.channel = new BaseChannel({
			client: target.client,
			id: title.runs[0].navigationEndpoint.browseEndpoint.browseId,
			name: title.runs[0].text,
			subscriberCount: subscriberCountText?.simpleText,
			thumbnails: new Thumbnails().load(thumbnail.thumbnails),
		});

		// Like Count and Dislike Count
		const topLevelButtons = videoInfo.videoActions.menuRenderer.topLevelButtons;
		target.likeCount = stripToInt(BaseVideoParser.parseButtonRenderer(topLevelButtons[0]));

		// Tags and description
		target.tags =
			videoInfo.superTitleLink?.runs
				?.map((r: YoutubeRawData) => r.text.trim())
				.filter((t: string) => t) || [];
		target.description = videoInfo.videoDetails?.shortDescription || videoInfo.attributedDescription.content || "";

		// related videos
		const secondaryContents =
			data.response.contents.twoColumnWatchNextResults.secondaryResults?.secondaryResults
				.results;

		if (secondaryContents) {
			target.related.items = BaseVideoParser.parseRelatedFromSecondaryContent(
				secondaryContents,
				target.client
			);
			target.related.continuation = getContinuationFromItems(secondaryContents);
		}

		// captions
		if (videoInfo.captions) {
			target.captions = new VideoCaptions({ client: target.client, video: target }).load(
				videoInfo.captions.playerCaptionsTracklistRenderer
			);
		}

		return target;
	}

	static parseRelated(data: YoutubeRawData, client: Client): (VideoCompact | PlaylistCompact)[] {
		const secondaryContents: YoutubeRawData[] =
			data.onResponseReceivedEndpoints[0].appendContinuationItemsAction.continuationItems;

		return BaseVideoParser.parseRelatedFromSecondaryContent(secondaryContents, client);
	}

	static parseContinuation(data: YoutubeRawData): string | undefined {
		const secondaryContents =
			data.onResponseReceivedEndpoints[0].appendContinuationItemsAction.continuationItems;

		return getContinuationFromItems(secondaryContents);
	}

	static parseRawData(data: YoutubeRawData): YoutubeRawData {
		const contents = data.response.contents.twoColumnWatchNextResults.results.results.contents;

		const primaryInfo = contents.find((c: YoutubeRawData) => "videoPrimaryInfoRenderer" in c)
			.videoPrimaryInfoRenderer;
		const secondaryInfo = contents.find(
			(c: YoutubeRawData) => "videoSecondaryInfoRenderer" in c
		).videoSecondaryInfoRenderer;
		const { videoDetails, captions } = data.playerResponse;
		return { ...secondaryInfo, ...primaryInfo, videoDetails, captions };
	}

	private static parseCompactRenderer(
		data: YoutubeRawData,
		client: Client
	): VideoCompact | PlaylistCompact | undefined {
		if ("compactVideoRenderer" in data) {
			return new VideoCompact({ client }).load(data.compactVideoRenderer);
		} else if ("compactRadioRenderer" in data) {
			return new PlaylistCompact({ client }).load(data.compactRadioRenderer);
		}
	}

	private static parseRelatedFromSecondaryContent(
		secondaryContents: YoutubeRawData[],
		client: Client
	): (VideoCompact | PlaylistCompact)[] {
		return secondaryContents
			.map((c: YoutubeRawData) => BaseVideoParser.parseCompactRenderer(c, client))
			.filter((c): c is VideoCompact | PlaylistCompact => c !== undefined);
	}

	private static parseButtonRenderer(data: YoutubeRawData): string {
		let likeCount;
		if (data.toggleButtonRenderer || data.buttonRenderer) {
			const buttonRenderer = data.toggleButtonRenderer || data.buttonRenderer;
			likeCount = (
				buttonRenderer.defaultText?.accessibility || buttonRenderer.accessibilityData
			).accessibilityData;
		} else if (data.segmentedLikeDislikeButtonRenderer) {
			const likeButton = data.segmentedLikeDislikeButtonRenderer.likeButton;
			const buttonRenderer = likeButton.toggleButtonRenderer || likeButton.buttonRenderer;
			likeCount = (
				buttonRenderer.defaultText?.accessibility || buttonRenderer.accessibilityData
			).accessibilityData;
		} else if (data.segmentedLikeDislikeButtonViewModel) {
			likeCount =
				data.segmentedLikeDislikeButtonViewModel.likeButtonViewModel.likeButtonViewModel
					.toggleButtonViewModel.toggleButtonViewModel.defaultButtonViewModel
					.buttonViewModel.accessibilityText;
		}

		return likeCount;
	}
}
