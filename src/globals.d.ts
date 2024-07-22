import { BskyAgent } from "@atproto/api";

declare global {
  interface Env {
    Bindings: {
      BSKY_SERVICE_URL: string;
      BSKY_AUTH_USERNAME: string;
      BSKY_AUTH_PASSWORD: string;
      VIXBLUESKY_APP_DOMAIN: string;
    };
    Variables: {
      Agent: BskyAgent;
    };
  }
}
