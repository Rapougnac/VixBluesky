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

const Meta = ({ post }: { post: AppBskyFeedDefs.PostView }) => (
  <>
    <meta name="twitter:card" content="summary_large_image" />
  </>
);

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

export const Post = ({ post, url, appDomain }: PostProps) => {
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

      {images.length !== 0 && <Images images={images} />}

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
