import express from "express";
import createHttpError from "http-errors";
import uniqid from "uniqid";
import { getMedias, writeMedias } from "../../lib/fs-tools.js";
import { checkMediaSchema, triggerBadRequest } from "./validator.js";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import { getPDFReadableStream } from "../../lib/pdf-tools.js";
import { pipeline } from "stream";
const mediasRouter = express.Router();
mediasRouter.post(
  "/",
  checkMediaSchema,
  triggerBadRequest,
  async (req, res, next) => {
    try {
      const newMedia = {
        ...req.body,
        imbdId: uniqid(),
      };
      const mediasArray = await getMedias();
      mediasArray.push(newMedia);
      await writeMedias(mediasArray);
      res.status(201).send({ id: newMedia.imbdId });
    } catch (error) {
      next(error);
    }
  }
);
mediasRouter.get("/", async (req, res, next) => {
  try {
    const mediasArray = await getMedias();
    res.send(mediasArray);
  } catch (error) {
    next(error);
  }
});

mediasRouter.get("/:id", async (req, res, next) => {
  try {
    const mediasArray = await getMedias();
    const media = mediasArray.find((m) => m.imbdId === req.params.id);
    if (media) {
      res.send(media);
    } else {
      next(
        createHttpError(404, `media with imdbId ${req.params.id} is not found`)
      );
    }
  } catch (error) {
    next(error);
  }
});

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "medias/poster",
    },
  }),
}).single("poster");

mediasRouter.post(
  "/:id/poster",
  cloudinaryUploader,

  async (req, res, next) => {
    try {
      if (req.file) {
        console.log("FILE:", req.file);

        const mediasArray = await getMedias();
        const index = mediasArray.findIndex((m) => m.imbdId === req.params.id);
        if (index !== -1) {
          const oldMedia = mediasArray[index];
          const updatedMeida = {
            ...oldMedia,

            poster: req.file.path,
          };
          mediasArray[index] = updatedMeida;
          await writeMedias(mediasArray);
        } else {
          next(
            createHttpError(404, `media with imdbid ${req.params.id} not found`)
          );
        }

        res.send("uploaded");
      } else {
        next(createHttpError(400, "upload a poster"));
      }
    } catch (error) {
      next(error);
    }
  }
);

mediasRouter.get("/:id/pdf", async (req, res, next) => {
  try {
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${req.params.id}.pdf`
    );
    const mediasArray = await getMedias();
    const media = mediasArray.find((m) => m.imbdId === req.params.id);
    const source = await getPDFReadableStream(media);
    const destination = res;
    pipeline(source, destination, (err) => {
      if (err) console.log(err);
    });
  } catch (error) {
    next(error);
  }
});

export default mediasRouter;
