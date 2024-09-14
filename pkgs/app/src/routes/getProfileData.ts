/** @jsx jsx */
import { jsx } from "hono/jsx";
import { Handler } from "hono";
import { HTTPException } from "hono/http-exception";
import { fetchProfile } from "../lib/fetchProfile";

export const getProfileData: Handler<
  Env,
  "/profile/:user/json" | "/https://bsky.app/profile/:user/json"
> = async (c) => {
  const { user } = c.req.param();
  const agent = c.get("Agent");
  const { data, success } = await fetchProfile(agent, { user });
  if (!success) {
    throw new HTTPException(500, {
      message: "Failed to fetch the profile!",
    });
  }
  return c.json(data);
};
