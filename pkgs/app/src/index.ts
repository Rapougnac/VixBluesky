import { Hono } from "hono";
import { AtpSessionData, BskyAgent } from "@atproto/api";
import { getPost } from "./routes/getPost";
import { getPostData } from "./routes/getPostData";
import { getOEmbed } from "./routes/getOEmbed";
import { getProfileData } from "./routes/getProfileData";
import { getProfile } from "./routes/getProfile";
import { HTTPException } from "hono/http-exception";

const app = new Hono<Env>();

app.use("*", async (c, next) => {
  const agent = new BskyAgent({
    service: c.env.BSKY_SERVICE_URL,
    async persistSession(_, session) {
      if (session) {
        return c.env.bskyx.put("session", JSON.stringify(session));
      }
    },
  });
  try {
    const rawSession = await c.env.bskyx.get("session");
    if (rawSession) {
      const session = JSON.parse(rawSession) as AtpSessionData;
      await agent.resumeSession(session);
    } else {
      await agent.login({
        identifier: c.env.BSKY_AUTH_USERNAME,
        password: c.env.BSKY_AUTH_PASSWORD,
      });
    }
    c.set("Agent", agent);
  } catch (error) {
    const err = new Error("Failed to login to Bluesky!", {
      cause: error,
    });
    throw new HTTPException(500, {
      message: `${err.message} \n\n ${err.cause} \n\n ${err.stack}`,
    });
  }
  return next();
});

app.get("/", async (c) => {
  return c.redirect("https://github.com/Rapougnac/VixBluesky");
});

app.get("/profile/:user/post/:post", getPost);
app.get("/https://bsky.app/profile/:user/post/:post", getPost);

app.get("/profile/:user/post/:post/json", getPostData);
app.get("/https://bsky.app/profile/:user/post/:post/json", getPostData);

app.get("/profile/:user", getProfile);
app.get("/https://bsky.app/profile/:user", getProfile);

app.get("/profile/:user/json", getProfileData);
app.get("/https://bsky.app/profile/:user/json", getProfileData);

app.get("/oembed", getOEmbed);

export default app;
