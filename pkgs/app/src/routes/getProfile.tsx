import { Handler } from "hono";
import { HTTPException } from "hono/http-exception";
import { fetchProfile } from "../lib/fetchProfile";
import { Profile } from "../components/Profile";

export const getProfile: Handler<
  Env,
  "/profile/:user" | "/https://bsky.app/profile/:user"
> = async (c) => {
  const { user } = c.req.param();
  const agent = c.get("Agent");
  const { data, success } = await fetchProfile(agent, { user });
  if (!success) {
    throw new HTTPException(500, {
      message: "Failed to fetch the profile!",
    });
  }
  return c.html(
    <Profile
      profile={data}
      url={c.req.path}
      appDomain={c.env.VIXBLUESKY_APP_DOMAIN}
    />
  );
};
