import { Handler } from "hono";
import { HTTPException } from "hono/http-exception";
import { fetchPost } from "../lib/fetchPostData";
import { Post } from "../components/Post";
import { processVideoEmbed, StreamInfo } from "../lib/processVideoEmbed";
import { parseEmbedImages } from "../lib/parseEmbedImages";
import { checkType, constructVideoUrl } from "../lib/utils";

export const getPost: Handler<
  Env,
  "/profile/:user/post/:post" | "/https://bsky.app/profile/:user/post/:post"
> = async (c) => {
  const { user, post } = c.req.param();
  const isDirect = c.req.query("direct");

  const agent = c.get("Agent");
  const { data, success } = await fetchPost(agent, { user, post });

  if (!success) {
    throw new HTTPException(500, {
      message: "Failed to fetch the post!",
    });
  }

  const fetchedPost = data.posts[0];

  const images = parseEmbedImages(fetchedPost);

  let videoMetaData: StreamInfo[] | undefined;

  if (
    checkType("app.bsky.embed.video", fetchedPost.embed) ||
    checkType("app.bsky.embed.video", fetchedPost.embed?.media)
  ) {
    videoMetaData = await processVideoEmbed(
      // @ts-expect-error
      fetchedPost.embed?.media ?? fetchedPost.embed
    );
  }

  if (!isDirect) {
    return c.html(
      <Post
        post={fetchedPost}
        url={c.req.path}
        appDomain={c.env.VIXBLUESKY_APP_DOMAIN}
        videoMetadata={videoMetaData}
        apiUrl={c.env.VIXBLUESKY_API_URL}
        images={images}
      />
    );
  }

  if (Array.isArray(images) && images.length !== 0) {
    const url = images[0].fullsize;
    return c.redirect(url);
  }

  if (videoMetaData) {
    const videoUrl = constructVideoUrl(
      videoMetaData[0],
      c.env.VIXBLUESKY_API_URL
    );
    
    return c.redirect(videoUrl);
  }
};
