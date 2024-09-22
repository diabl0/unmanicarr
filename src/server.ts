import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import axios from "axios";

const UNMANIC_URL = process.env.UNMANIC_URL ?? "http://10.0.1.150:8888/unmanic";
const LISTEN_PORT = process.env.LISTEN_PORT ? parseInt(process.env.LISTEN_PORT, 10) : 3000;

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
    .then((result) => {
      console.log("Unmanic added task", result.data);
    })
    .catch((error) => {
      console.error("Unmanic error", {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        error,
      });
    });
}

function mapSonarrPath(path: string): string {
  return path.replace(SONARR_MAPPING_FROM, SONARR_MAPPING_TO);
}

function mapRadarrPath(path: string): string {
  return path.replace(RADARR_MAPPING_FROM, RADARR_MAPPING_TO);
}

app.get("/health", (req: Request, res: Response) => {
  res.send({ status: "ok" });
});

app.post("/sonarr", async (req: Request, res: Response) => {
  console.log("POST /sonarr", { body: req.body, params: req.params, json: JSON.stringify(req.body) });

  switch (req.body.eventType) {
    case "Download":
      const data: { files: string[]; name: string } = { files: [], name: req.body?.release?.releaseTitle ?? "Unknown" };
      if (req.body.episodeFiles) {
        data.files = req.body.episodeFiles.map((file: { relativePath: string }) => {
          return mapSonarrPath(req.body.series.path + "/" + file.relativePath);
        });
      }
      if (req.body.episodeFile) {
        data.files = [mapSonarrPath(req.body.series.path + "/" + req.body.episodeFile.relativePath)];
      }
      for (const file of data.files) {
        sendToUnmanic(file, SONARR_LIBRARY_ID).catch((error) => {
          console.log(error);
        });
      }
      break;
    default:
      break;
  }

  res.json({ status: 200 });
});

app.post("/radarr", async (req: Request, res: Response) => {
  console.log("POST /radarr", { body: req.body, params: req.params, json: JSON.stringify(req.body) });

  switch (req.body.eventType) {
    case "Download":
      sendToUnmanic(
        mapRadarrPath(req.body.movie.folderPath + "/" + req.body.movieFile.relativePath),
        RADARR_LIBRARY_ID,
      ).catch((error) => {
        console.log(error);
      });
      break;
    default:
      break;
  }

  res.json({ status: 200 });
});

app.listen(LISTEN_PORT, () => {
  console.log(`Server is running on port: ${LISTEN_PORT}`);
});
