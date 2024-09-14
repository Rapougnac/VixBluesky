import { AppBskyFeedDefs } from "@atproto/api";

export interface StreamInfo {
  bandwidth: number;
  resolution: {
    width: number;
    height: number;
  };
  codecs: string;
  uri: string;
}

export interface M3U8Data {
  version: number;
  streams: StreamInfo[];
}

export async function processVideoEmbed(post: AppBskyFeedDefs.PostView) {
  const videoUrl = post.embed?.playlist as string | undefined;

  if (!videoUrl) {
    return;
  }

  const contents = await fetch(videoUrl).then((res) => res.text());

  const initalUrl = removeLastPathSegment(videoUrl);

  const { streams } = await parseM3U8(initalUrl, contents);

  return streams;
}

async function parseM3U8(
  initalUrl: string,
  contents: string
): Promise<M3U8Data> {
  const lines = contents
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  let version = 0;
  const streams: StreamInfo[] = [];

  for (const line of lines) {
    if (line.startsWith("#EXT-X-VERSION:")) {
      version = Number(line.split(":")[1]);
    } else if (line.startsWith("#EXT-X-STREAM-INF:")) {
      const attribs = line.split(":")[1].split(",");
      const sInfo: StreamInfo = {
        bandwidth: 0,
        resolution: {
          width: 0,
          height: 0,
        },
        codecs: "",
        uri: "",
      };

      for (const attrib of attribs) {
        const [key, value] = attrib.split("=");
        switch (key) {
          case "BANDWIDTH":
            sInfo.bandwidth = Number(value);
            break;
          case "RESOLUTION":
            const [width, height] = value.split("x").map(Number);
            sInfo.resolution = { width, height };
            break;
          case "CODECS":
            sInfo.codecs = value.replaceAll('"', "");
            break;
        }
      }

      streams.push(sInfo);
    } else if (line.includes("m3u8")) {
      const resolvedUrl = `${initalUrl}/${line}`;

      console.log(resolvedUrl);

      const cont = await fetch(resolvedUrl).then((res) => res.text());

      const parsed = await parseM3U8(removeLastPathSegment(resolvedUrl), cont);

      console.log(parsed);

      streams.at(-1)!.uri = parsed.streams[0].uri;
    } else if (line.includes(".ts")) {
      streams.push({
        bandwidth: 0,
        resolution: {
          width: 0,
          height: 0,
        },
        codecs: "",
        uri: `${initalUrl}/${line}`,
      });
    } else {
      // Discard
      continue;
    }
  }

  console.log(streams);

  return { version, streams };
}

function removeLastPathSegment(url: string) {
  return url.slice(0, url.lastIndexOf("/"));
}
