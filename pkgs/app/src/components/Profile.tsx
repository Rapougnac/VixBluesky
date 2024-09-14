import { AppBskyActorDefs } from "@atproto/api";

import { Layout } from "./Layout";
import { OEmbedTypes } from "../routes/getOEmbed";

interface ProfileProps {
  profile: AppBskyActorDefs.ProfileViewDetailed;
  url: string;
  appDomain: string;
}

export const Profile = ({ profile, url, appDomain }: ProfileProps) => (
  <Layout url={url}>
    <meta name="og:type" content="article" />
    <meta name="twitter:creator" content={`@${profile.handle}`} />
    <meta property="og:description" content={profile.description ?? ""} />
    <meta
      property="og:title"
      content={`${profile.displayName} (@${profile.handle})`}
    />
    <meta property="og:image" content={profile.avatar} />
    <meta properpty="article:published_time" content={profile.createdAt} />

    <link
      type="application/json+oembed"
      href={`https://${appDomain}/oembed?type=${OEmbedTypes.Profile}&follows=${
        profile.followsCount
      }&posts=${profile.postsCount}&avatar=${encodeURIComponent(
        profile.avatar ?? ""
      )}`}
    />
  </Layout>
);
