import { BskyAgent } from "@atproto/api";

export interface fetchProfileOptions {
  user: string;
}

export async function fetchProfile(
  agent: BskyAgent,
  { user }: fetchProfileOptions
) {
  return agent.getProfile({
    actor: user,
  });
}
