import { AppBskyFeedDefs, AppBskyEmbedImages } from "@atcute/client/lexicons";
import { checkType } from "./utils";

export function parseEmbedImages(
  post: AppBskyFeedDefs.PostView
): string | AppBskyEmbedImages.ViewImage[] {
  let images: AppBskyEmbedImages.ViewImage[] = [];

  const embed = post.embed as typeof post.embed & {
    record: any;
    media: any;
    images: any;
    external: any;
  };

  if (checkType("app.bsky.embed.record#view", embed)) {
    if (checkType("app.bsky.embed.record#viewRecord", embed?.record)) {
      if (
        embed?.record.embeds &&
        checkType("app.bsky.embed.images#view", embed.record.embeds[0])
      ) {
        images = [
          ...images,
          ...(embed.record.embeds[0].images as AppBskyEmbedImages.ViewImage[]),
        ];
      }
    }
  }
  if (checkType("app.bsky.embed.recordWithMedia#view", embed)) {
    if (checkType("app.bsky.embed.images#view", embed.media)) {
      images = [
        ...images,
        ...(embed.media.images as AppBskyEmbedImages.ViewImage[]),
      ];
    }
  }
  if (checkType("app.bsky.embed.images#view", embed)) {
    images = [...images, ...embed.images];
  }

  const isEmptyImages = images.length === 0;

  if (isEmptyImages) {
    if (checkType("app.bsky.embed.external#view", embed)) {
      return embed.external.uri;
    }
  }

  return isEmptyImages ? post.author.avatar ?? "" : images;
}
