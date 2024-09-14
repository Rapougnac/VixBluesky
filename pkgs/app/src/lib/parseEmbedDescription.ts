import {
  AppBskyEmbedRecord,
  AppBskyEmbedRecordWithMedia,
  AppBskyFeedDefs,
  AppBskyFeedPost,
} from "@atproto/api";

export function parseEmbedDescription(post: AppBskyFeedDefs.PostView) {
  if (AppBskyFeedPost.isRecord(post.record)) {
    if (AppBskyEmbedRecord.isView(post.embed)) {
      const { success: isView } = AppBskyEmbedRecord.validateView(post.embed);
      if (isView && AppBskyEmbedRecord.isViewRecord(post.embed.record)) {
        const { success: isViewRecord } = AppBskyEmbedRecord.validateViewRecord(
          post.embed.record
        );
        if (isViewRecord) {
          // @ts-expect-error For some reason the original post value is typed as {}
          return `${post.record.text}\n\nQuoting @${post.embed.record.author.handle}\n➥  ${post.embed.record.value.text}`;
        }
      }
    }
    if (AppBskyEmbedRecordWithMedia.isView(post.embed)) {
      const { success: isView } = AppBskyEmbedRecordWithMedia.validateView(
        post.embed
      );
      if (isView && AppBskyEmbedRecord.isViewRecord(post.embed.record.record)) {
        const { success: isViewRecord } = AppBskyEmbedRecord.validateViewRecord(
          post.embed.record.record
        );
        if (isViewRecord) {
          // @ts-expect-error For some reason the original post value is typed as {}
          return `${post.record.text}\n\nQuoting @${post.embed.record.record.author.handle}\n➥  ${post.embed.record.record.value.text}`;
        }
      }
    }
    return post.record.text;
  }
  return "";
}
