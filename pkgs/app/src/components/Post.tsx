import { AppBskyEmbedImages, AppBskyFeedDefs } from "@atproto/api";

import { Layout } from "./Layout";
import { OEmbedTypes } from "../routes/getOEmbed";
import { parseEmbedImages } from "../lib/parseEmbedImages";
import { parseEmbedDescription } from "../lib/parseEmbedDescription";
import { StreamInfo } from "../lib/processVideoEmbed";

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

const Video = ({
  streamInfo,
  apiUrl,
}: {
  streamInfo: StreamInfo;
  apiUrl: string;
}) => {
  const url = `${apiUrl}generate/${encodeURIComponent(streamInfo.uri)}.mp4`;

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

  return (
    <Layout url={url}>
      <meta name="twitter:creator" content={`@${post.author.handle}`} />
      <meta property="og:description" content={parseEmbedDescription(post)} />
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
      {/* <meta property="og:image" content={post.author.avatar} /> */}

      {!isAuthor && <Meta post={post} />}

      {images.length !== 0 && !videoMetadata && <Images images={images} />}

      {videoMetadata && (
        <Video apiUrl={apiUrl} streamInfo={videoMetadata.at(-1)!} />
      )}

      <link
        rel="alternate"
        type="application/json+oembed"
        href={`https:/${appDomain}/oembed?type=${OEmbedTypes.Post}&replies=${
          post.replyCount
        }&reposts=${post.repostCount}&likes=${
          post.likeCount
        }&avatar=${encodeURIComponent(post.author.avatar ?? "")}`}
      />
    </Layout>
  );
};
