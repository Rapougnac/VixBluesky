import { BskyAgent } from "@atproto/api";

export interface fetchPostOptions {
  user: string;
  post: string;
}

export async function fetchPost(
  agent: BskyAgent,
  { user, post }: fetchPostOptions
) {
  const { data: userData } = await agent.getProfile({
    actor: user,
  });
  return agent.getPosts({
    uris: [`at://${userData.did}/app.bsky.feed.post/${post}`],
  });
}
