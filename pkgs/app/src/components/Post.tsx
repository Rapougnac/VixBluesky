import { AppBskyEmbedImages, AppBskyFeedDefs } from "@atproto/api";

import { Layout } from "./Layout";
import { OEmbedTypes } from "../routes/getOEmbed";
import { parseEmbedImages } from "../lib/parseEmbedImages";
import { parseEmbedDescription } from "../lib/parseEmbedDescription";
import { StreamInfo } from "../lib/processVideoEmbed";
import { checkType, join } from "../lib/utils";

interface PostProps {
  post: AppBskyFeedDefs.PostView;
  url: string;
  appDomain: string;
  videoMetadata?: StreamInfo[] | undefined;
  apiUrl: string;
}

const Meta = ({ post }: { post: AppBskyFeedDefs.PostView }) => (
  <>
    <meta name="twitter:card" content="summary_large_image" />
  </>
);

const constructVideoUrl = (streamInfo: StreamInfo, apiUrl: string) => {
  const url = new URL(streamInfo.masterUri);

  const [did, id, quality] = url.pathname.split("/").slice(2);

  const parts = [did, id, quality];

  return `${apiUrl}${btoa(join(parts, ";"))}.mp4`;
};

const Video = ({
  streamInfo,
  apiUrl,
  appDomain,
  post,
  description,
}: {
  streamInfo: StreamInfo;
  apiUrl: string;
  appDomain: string;
  post: AppBskyFeedDefs.PostView;
  description: string;
}) => {
  const url = constructVideoUrl(streamInfo, apiUrl);

  return (
    <>
      <meta property="twitter:card" content="player" />
      <meta property="twitter:player" content={url} />
      <meta property="twitter:player:stream" content={url} />
      <meta property="og:type" content="video.other" />
      <meta property="og:video" content={url} />
      <meta property="og:video:secure_url" content={url} />
      <meta property="og:video:type" content="video/mp4" />
      <meta
        property="og:video:width"
        content={streamInfo.resolution.width.toString()}
      />
      <meta
        property="og:video:height"
        content={streamInfo.resolution.height.toString()}
      />
      <meta
        property="twitter:player:width"
        content={streamInfo.resolution.width.toString()}
      />
      <meta
        property="twitter:player:height"
        content={streamInfo.resolution.height.toString()}
      />

      <link
        rel="alternate"
        type="application/json+oembed"
        href={`https:/${appDomain}/oembed?type=${OEmbedTypes.Video}&replies=${
          post.replyCount
        }&reposts=${post.repostCount}&likes=${
          post.likeCount
        }&avatar=${encodeURIComponent(
          post.author.avatar ?? ""
        )}&description=${encodeURIComponent(description)}`}
      />
    </>
  );
};

const Images = ({
  images,
}: {
  images: AppBskyEmbedImages.ViewImage[] | string;
}) => (
  <>
    {typeof images === "string" ? (
      <>
        <meta property="og:image" content={images} />
        <meta property="twitter:image" content={images} />
      </>
    ) : (
      images.map((img, i) => (
        <>
          <meta property="og:image" content={img.fullsize} />(
          {i === 0 && <meta property="twitter:image" content={img.fullsize} />})
        </>
      ))
    )}
  </>
);

export const Post = ({
  post,
  url,
  appDomain,
  videoMetadata,
  apiUrl,
}: PostProps) => {
  const images = parseEmbedImages(post);
  const isAuthor = images === post.author.avatar;
  let description = parseEmbedDescription(post);
  const isVideo = checkType(
    "app.bsky.embed.video",
    post.embed?.media ?? post.embed
  );
  const streamInfo = videoMetadata?.at(-1);
  const isTooLong = streamInfo!.uri.length > 4;
  const shouldOverrideForVideo = isVideo && isTooLong;

  let videoUrl;

  if (isVideo && isTooLong) {
    videoUrl = constructVideoUrl(streamInfo!, apiUrl);
    description += `\n[Video is too long to embed!]`;
  }

  return (
    <Layout url={url}>
      <meta name="twitter:creator" content={`@${post.author.handle}`} />
      <meta property="og:description" content={description} />
      <meta
        property="og:title"
        content={`${post.author.displayName} (@${post.author.handle})`}
      />
      <meta
        property="twitter:title"
        content={`${post.author.displayName} (@${post.author.handle})`}
      />
      <meta property="og:updated_time" content={post.indexedAt} />
      <meta property="article:published_time" content={post.indexedAt} />

      {!isAuthor && <Meta post={post} />}

      {images.length !== 0 && (shouldOverrideForVideo || !isVideo) && (
        <Images images={images} />
      )}

      {isVideo && streamInfo!.uri.length <= 4 && (
        <Video
          apiUrl={apiUrl}
          streamInfo={streamInfo!}
          appDomain={appDomain}
          description={description}
          post={post}
        />
      )}

      {(shouldOverrideForVideo || !isVideo) && (
        <link
          rel="alternate"
          type="application/json+oembed"
          href={`https:/${appDomain}/oembed?type=${OEmbedTypes.Post}&replies=${
            post.replyCount
          }&reposts=${post.repostCount}&likes=${
            post.likeCount
          }&avatar=${encodeURIComponent(
            post.author.avatar ?? ""
          )}&description=${encodeURIComponent(description)}${
            videoUrl ? `&videoUrl=${encodeURIComponent(videoUrl)}` : ""
          }`}
        />
      )}
    </Layout>
  );
};
