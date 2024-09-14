import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";

import { PassThrough } from "node:stream";
import fs from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

ffmpeg.setFfmpegPath(ffmpegPath as string);

export function tsToMpeg4(buffer: Buffer | Uint8Array): Promise<Buffer> {
  return new Promise((res, rej) => {
    const input = new PassThrough();

    input.end(buffer);

    const tempFilePath = path.join(tmpdir(), `output-${Date.now()}.mp4`);

    // The streams appear to be H264-AVC encoded, so all that needs to be done for Discord to display them is to "remux" the streams into an mp4 container

    ffmpeg(input)
      .outputOption(
        "-c",
        "copy",
        "-movflags",
        "faststart",
        "-preset",
        "ultrafast"
      )
      .on("end", async () => {
        try {
          const ob = await fs.readFile(tempFilePath);
          await fs.unlink(tempFilePath);
          res(ob);
        } catch (e) {
          rej(e);
        }
      })
      .on("error", async (err, stdout, stderr) => {
        console.error("Error:", err.message);
        console.error("ffmpeg stdout:", stdout);
        console.error("ffmpeg stderr:", stderr);
        try {
          await fs.unlink(tempFilePath);
        } catch (e) {
          rej(e);
        }
        rej(err);
      })
      .save(tempFilePath);
  });
}
