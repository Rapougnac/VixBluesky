import { type ChildProcess, spawn as s } from "node:child_process";

import { type FastifyReply } from "fastify";
import type { Writable, Readable } from "node:stream";

export function bufferVideo(masterUrl: string, res: FastifyReply) {
  let process: ChildProcess;
  const cleanup = () => {
    process?.kill("SIGTERM");
    setTimeout(() => process?.kill("SIGKILL"), 5000);
    res.raw.end();
  };

  const args = [
    "-loglevel",
    "-8",
    "-i",
    masterUrl,
    "-c:v",
    "copy",
    "-c:a",
    "aac",
    "-bsf:a",
    "aac_adtstoasc",
    "-movflags",
    "faststart+frag_keyframe+empty_moov",
    "-f",
    "mp4",
    "pipe:3",
  ];

  process = s("ffmpeg", args, {
    windowsHide: true,
    stdio: ["inherit", "inherit", "inherit", "pipe"],
  });

  const [, , , stream] = process.stdio;
  pipe(stream, res.raw, cleanup);
  process.on("close", cleanup);
  process.on("exit", cleanup);
  res.raw.on("finish", cleanup);
  return stream;
}

function pipe(
  from: Readable | Writable | undefined | null,
  to: NodeJS.WritableStream,
  cleanup: () => void
) {
  from?.on("error", cleanup).on("close", cleanup);
  to.on("error", cleanup).on("close", cleanup);
  from?.pipe(to);
}
