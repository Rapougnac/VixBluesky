// import { Handler } from "hono";
// import { fetchPost } from "../lib/fetchPostData";
// import { HTTPException } from "hono/http-exception";
// import { processVideoEmbed } from "../lib/processVideoEmbed";

// export const getPostVideo: Handler<
//   Env,
//   | "/profile/:user/post/:post/video"
//   | "/https://bsky.app/profile/:user/post/:post/video"
// > = async (c) => {
//   const { user, post } = c.req.param();
//   const agent = c.get("Agent");
//   const { data, success } = await fetchPost(agent, { user, post });

//   if (!success) {
//     throw new HTTPException(500, {
//       message: "Failed to fetch the post!",
//     });
//   }

//   const fetchedPost = data.posts[0];

//   let videoBuffer: Uint8Array | undefined;

//   if (
//     typeof fetchedPost.embed?.$type === "string" &&
//     fetchedPost.embed?.$type.startsWith("app.bsky.embed.video")
//   ) {
//     videoBuffer = await processVideoEmbed(fetchedPost);
//   }

//   if (!videoBuffer) {
//     throw new HTTPException(404, {
//       message: "Failed to fetch the video!",
//     });
//   }

//   c.header("Content-Type", "video/mp4");
//   c.header("Content-Length", videoBuffer.length.toString());
//   c.header("Cache-Control", "s-maxage=21600");

//   return c.body(videoBuffer);
// };
