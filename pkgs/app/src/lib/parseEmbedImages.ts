import {
  AppBskyEmbedImages,
  AppBskyEmbedRecord,
  AppBskyEmbedRecordWithMedia,
  AppBskyFeedDefs,
} from "@atproto/api";

export function parseEmbedImages(
  post: AppBskyFeedDefs.PostView
): string | AppBskyEmbedImages.ViewImage[] {
  let images: AppBskyEmbedImages.ViewImage[] = [];

  if (AppBskyEmbedRecord.isView(post.embed)) {
    const { success: isView } = AppBskyEmbedRecord.validateView(post.embed);
    if (isView && AppBskyEmbedRecord.isViewRecord(post.embed.record)) {
      const { success: isViewRecord } = AppBskyEmbedRecord.validateViewRecord(
        post.embed.record
      );
      if (
        isViewRecord &&
        post.embed.record.embeds &&
        AppBskyEmbedImages.isView(post.embed.record.embeds[0])
      ) {
        const { success: isImageView } = AppBskyEmbedImages.validateView(
          post.embed.record.embeds[0]
        );
        if (isImageView) {
          images = [...images, ...post.embed.record.embeds[0].images];
        }
      }
    }
  }
  if (AppBskyEmbedRecordWithMedia.isView(post.embed)) {
    const { success: isView } = AppBskyEmbedRecordWithMedia.validateView(
      post.embed
    );
    if (isView && AppBskyEmbedImages.isView(post.embed.media)) {
      const { success: isImageView } = AppBskyEmbedImages.validateView(
        post.embed.media
      );
      if (isImageView) {
        images = [...images, ...post.embed.media.images];
      }
    }
  }
  if (AppBskyEmbedImages.isView(post.embed)) {
    const { success: isImageView } = AppBskyEmbedImages.validateView(
      post.embed
    );
    if (isImageView) {
      images = [...images, ...post.embed.images];
    }
  }

  return images.length === 0 ? post.author.avatar ?? "" : images;
}
