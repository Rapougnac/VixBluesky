import { AppBskyEmbedImages, AppBskyFeedDefs } from "@atproto/api";

import { Layout } from "./Layout";
import { OEmbedTypes } from "../routes/getOEmbed";
import { parseEmbedImages } from "../lib/parseEmbedImages";
import { parseEmbedDescription } from "../lib/parseEmbedDescription";

interface PostProps {
  post: AppBskyFeedDefs.PostView;
  url: string;
  appDomain: string;
}

const Meta = (post: AppBskyFeedDefs.PostView) => (
  <>
    <meta name="article:published_time" content={post.indexedAt} />
    <meta name="twitter:card" content="summary_large_image" />
    {/* <meta name="apple-mobile-web-app-title" content={post.author.handle} />
    <link rel="apple-touch-icon" href={post.author.avatar} /> */}
  </>
);

export const Post = ({ post, url, appDomain }: PostProps) => {
  const images = parseEmbedImages(post);
  const isAuthor = images === post.author.avatar;

  return (
    <Layout url={url}>
      <meta name="twitter:creator" content={`@${post.author.handle}`} />
      <meta property="og:description" content={parseEmbedDescription(post)} />
      <meta property="og:title" content={post.author.displayName} />
      {console.log(post)}
      <meta property="og:updated_time" content={post.indexedAt} />
      <meta property="article:published_time" content={post.indexedAt} />

      {images && typeof images === "string" ? (
        <meta property="og:image" content={images} />
      ) : (
        (images as AppBskyEmbedImages.ViewImage[]).map((img) => (
          <meta property="og:image" content={img.fullsize} />
        ))
      )}

      {!isAuthor && <Meta {...post} />}

      <link
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
