import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import axios from "axios";

const UNMANIC_URL = process.env.UNMANIC_URL ?? "http://10.0.1.150:8888/unmanic";

const SONARR_LIBRARY_ID = process.env.SONARR_LIBRARY_ID ? parseInt(process.env.SONARR_LIBRARY_ID, 10) : 1;
const SONARR_MAPPING_FROM = process.env.SONARR_MAPPING_FROM ?? "/data/Media/";
const SONARR_MAPPING_TO = process.env.SONARR_MAPPING_TO ?? "/media/";

const RADARR_LIBRARY_ID = process.env.RADARR_LIBRARY_ID ? parseInt(process.env.RADARR_LIBRARY_ID, 10) : 1;
const RADARR_MAPPING_FROM = process.env.RADARR_MAPPING_FROM ?? "/data/Media/";
const RADARR_MAPPING_TO = process.env.RADARR_MAPPING_TO ?? "/media/";

const app = express();
app.use(bodyParser.json());

async function sendToUnmanic(file: string, libraryId: number) {
  return axios
    .post(UNMANIC_URL + "/api/v2/pending/create", {
      path: file,
      library_id: libraryId,
      type: "local",
    })
    .catch((error) => {
      console.error("Got error", { status: error.response.status, statusText: error.response.statusText });
    });
}

function mapSonarrPath(path: string) {
  return path.replace(SONARR_MAPPING_FROM, SONARR_MAPPING_TO);
}

app.get("/health", (req: Request, res: Response) => {
  res.send({ status: "ok" });
});

app.post("/sonarr", async (req: Request, res: Response) => {
  switch (req.body.eventType) {
    case "Download":
      const data = {
        files: req.body.episodeFiles.map((file: { relativePath: string }) => {
          return mapSonarrPath(req.body.series.path + "/" + file.relativePath);
        }),
        name: req.body?.release?.releaseTitle,
      };
      for (const file of data.files) {
        sendToUnmanic(file, SONARR_LIBRARY_ID).catch((error) => {
          console.log(error);
        });
      }
      break;
    default:
      console.log("POST /sonarr", { body: req.body, params: req.params, json: JSON.stringify(req.body) });
      break;
  }

  res.json({ status: 200 });
});
app.post("/radarr", async (req: Request, res: Response) => {
  switch (req.body.eventType) {
    default:
      console.log("POST /radarr", { body: req.body, params: req.params, json: JSON.stringify(req.body) });
      break;
  }

  res.json({ status: 200 });
});

app.listen(3000, () => {
  console.log(`Server is running on http://localhost:3000`);
});
