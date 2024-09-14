import { Handler } from "hono";
import { HTTPException } from "hono/http-exception";
import { fetchPost } from "../lib/fetchPostData";

export const getPostData: Handler<
  Env,
  | "/profile/:user/post/:post/json"
  | "/https://bsky.app/profile/:user/post/:post/json"
> = async (c) => {
  const { user, post } = c.req.param();
  const agent = c.get("Agent");
  const { data, success } = await fetchPost(agent, { user, post });
  if (!success) {
    throw new HTTPException(500, {
      message: "Failed to fetch the post!",
    });
  }
  return c.json(data);
};
