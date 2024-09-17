import fastify from "fastify";
import { tsToMpeg4 } from "./utils";

const envToLogger = {
  development: {
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  },
  production: true,
  test: false,
};

type Env = keyof typeof envToLogger;

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly NODE_ENV: Env;
      readonly PORT: string | undefined;
    }
  }
}

const { NODE_ENV: env = "development" } = process.env;

const app = fastify({ logger: envToLogger[env] });

app.get("/", async (_, res) => res.redirect("https://bskyx.app"));

app.get<{ Params: { "*": string } }>(
  "/generate/*",
  {
    schema: {
      params: {
        type: "object",
        properties: {
          "*": { type: "string" },
        },
        required: ["*"],
      },
    },
  },
  async (req, res) => {
    // Idk anymore
    let urls = Buffer.from(req.params["*"], 'base64').toString().split(";");

    // Remove .mp4 extension if it exists
    if (urls.at(-1)?.endsWith(".mp4")) {
      urls = urls.slice(0, -1);
      urls.push(urls.at(-1)?.slice(0, -4) as string);
    }

    urls = urls.map((url) => decodeURIComponent(url));

    const result = await Promise.allSettled(
      urls.map((url) => fetch(url).then((res) => res.arrayBuffer()))
    );

    if (result.some((res) => res.status === "rejected")) {
      res.status(400).send({ error: "Failed to fetch video" });
      return;
    }

    const buffers = result.map((res) =>
      res.status === "fulfilled" ? new Uint8Array(res.value) : new Uint8Array(0)
    );

    const video = await tsToMpeg4(buffers);

    const fileName = `video-${new Date().toUTCString()}.mp4`;

    res.header("Content-Type", "video/mp4");
    res.header("Cache-Control", "public, max-age=604800");
    res.header("Content-Disposition", `attachment; filename=${fileName}`);
    res.send(video);
  }
);

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen({ port, host: "0.0.0.0" });
