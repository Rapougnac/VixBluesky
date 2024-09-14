import { BskyAgent } from "@atproto/api";
import type { KVNamespace } from "@cloudflare/workers-types";

declare global {
  interface Env {
    Bindings: {
      BSKY_SERVICE_URL: string;
      BSKY_AUTH_USERNAME: string;
      BSKY_AUTH_PASSWORD: string;
      VIXBLUESKY_APP_DOMAIN: string;
      VIXBLUESKY_API_URL: string;
      bskyx: KVNamespace;
    };
    Variables: {
      Agent: BskyAgent;
    };
  }
}
