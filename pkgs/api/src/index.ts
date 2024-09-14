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
    let url = req.params["*"];

    if (url.endsWith(".mp4")) {
      url = url.slice(0, -4);
    }

    url = decodeURIComponent(url);

    const result = await fetch(url).then((res) => res.arrayBuffer());

    const video = await tsToMpeg4(Buffer.from(result));

    res.header("Content-Type", "video/mp4");
    res.header("Cache-Control", "public, max-age=604800");
    res.send(video);
  }
);

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen({ port, host: "0.0.0.0" });
