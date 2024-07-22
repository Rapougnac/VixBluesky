import { Handler } from "hono";
import { HTTPException } from "hono/http-exception";
import { fetchPost } from "../lib/fetchPostData";
import { Post } from "../components/Post";

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

  return c.html(
    <Post
      post={data.posts[0]}
      url={c.req.path}
      appDomain={c.env.VIXBLUESKY_APP_DOMAIN}
    />
  );
};
