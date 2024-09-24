import { type ChildProcess, spawn as s } from "node:child_process";

import { type FastifyReply } from "fastify";
import ffmpeg from "ffmpeg-static";

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

  console.log(ffmpeg, args);

  process = s(...[ffmpeg!, args], {
    windowsHide: true,
    stdio: ["inherit", "inherit", "inherit", "pipe"],
  });

  const [, , , stream] = process.stdio;
  stream?.pipe(res.raw);
  process.on("close", cleanup);
  process.on("exit", cleanup);
  res.raw.on("finish", cleanup);
  return stream;
}
