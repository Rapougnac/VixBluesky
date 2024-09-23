import { Handler } from "hono";
import { HTTPException } from "hono/http-exception";
import { fetchPost } from "../lib/fetchPostData";
import { Post } from "../components/Post";
import { processVideoEmbed, StreamInfo, VideoMedia } from "../lib/processVideoEmbed";
import { checkType } from "../lib/utils";

export const getPost: Handler<
  Env,
  "/profile/:user/post/:post" | "/https://bsky.app/profile/:user/post/:post"
> = async (c) => {
  const { user, post } = c.req.param();
  const agent = c.get("Agent");
  const { data, success } = await fetchPost(agent, { user, post });

  if (!success) {
    throw new HTTPException(500, {
      message: "Failed to fetch the post!",
    });
  }

  const fetchedPost = data.posts[0];

  let videoMetaData: StreamInfo[] | undefined;

  if (
    checkType("app.bsky.embed.video", fetchedPost.embed) ||
    checkType("app.bsky.embed.video", fetchedPost.embed?.media)
  ) {
    // @ts-expect-error
    videoMetaData = await processVideoEmbed(fetchedPost.embed?.media || fetchedPost.embed);
  }

  return c.html(
    <Post
      post={fetchedPost}
      url={c.req.path}
      appDomain={c.env.VIXBLUESKY_APP_DOMAIN}
      videoMetadata={videoMetaData}
      apiUrl={c.env.VIXBLUESKY_API_URL}
    />
  );
};
