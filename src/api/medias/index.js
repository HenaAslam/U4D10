import express from "express";
import createHttpError from "http-errors";
import uniqid from "uniqid";
import { getMedias, writeMedias } from "../../lib/fs-tools.js";
import {
  checkMediaSchema,
  triggerBadRequest,
  checkReviewSchema,
} from "./validator.js";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import { getPDFReadableStream } from "../../lib/pdf-tools.js";
import { pipeline } from "stream";
import axios from "axios";
const mediasRouter = express.Router();
mediasRouter.post(
  "/",
  checkMediaSchema,
  triggerBadRequest,
  async (req, res, next) => {
    try {
      const newMedia = {
        ...req.body,
        imdbID: uniqid(),
        Reviews: [],
      };
      const mediasArray = await getMedias();
      mediasArray.push(newMedia);
      await writeMedias(mediasArray);
      res.status(201).send({ id: newMedia.imdbID });
    } catch (error) {
      next(error);
    }
  }
);
mediasRouter.get("/", async (req, res, next) => {
  try {
    const mediasArray = await getMedias();
    if (req.query && req.query.title) {
      const filteredMedias = mediasArray.filter((m) =>
        m.title.toLowerCase().includes(req.query.title.toLowerCase())
      );
      res.send(filteredMedias);
    } else {
      res.send(mediasArray);
    }
  } catch (error) {
    next(error);
  }
});
mediasRouter.get("/omdb", async (req, res, next) => {
  try {
    const mediasArray = await getMedias();
    if (req.query && req.query.title) {
      const filteredMedias = mediasArray.filter(
        (m) => m.Title.toLowerCase().includes(req.query.title.toLowerCase())
        //   m.title === req.query.title
      );
      if (filteredMedias.length === 0) {
        //check if its in omdb
        let response = await fetch(
          "https://www.omdbapi.com/?apikey=2404898d&s=" + req.query.title
        );

        if (response.ok) {
          let data = await response.json();
          console.log(data);
          if (data.Search.length > 0) {
            let movie = data.Search[0];
            console.log(movie);
            movie.Reviews = [];

            //push to media.json
            //return in response
            mediasArray.push(movie);
            await writeMedias(mediasArray);
            res.status(201).send(movie);
          } else {
            next(createHttpError(404, "movie not found"));
          }
        }
      } else {
        res.send(filteredMedias);
      }
    }
  } catch (error) {
    next(error);
  }
});

mediasRouter.get("/:id", async (req, res, next) => {
  try {
    const mediasArray = await getMedias();
    const media = mediasArray.find((m) => m.imdbID === req.params.id);
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
        const index = mediasArray.findIndex((m) => m.imdbID === req.params.id);
        if (index !== -1) {
          const oldMedia = mediasArray[index];
          const updatedMeida = {
            ...oldMedia,

            Poster: req.file.path,
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
    const media = mediasArray.find((m) => m.imdbID === req.params.id);
    console.log(media);
    const source = await getPDFReadableStream(media);
    const destination = res;
    pipeline(source, destination, (err) => {
      if (err) console.log(err);
    });
  } catch (error) {
    next(error);
  }
});

mediasRouter.get("/:id/reviews", async (req, res, next) => {
  try {
    let mediasArray = await getMedias();
    let media = mediasArray.find((m) => m.imdbID === req.params.id);
    if (media) {
      res.send(media.Reviews);
    } else {
      next(createHttpError(404, `movie with id ${req.params.id} not found`));
    }
  } catch (error) {
    next(error);
  }
});

mediasRouter.post(
  "/:id/reviews",
  checkReviewSchema,
  triggerBadRequest,
  async (req, res, next) => {
    try {
      const mediasArray = await getMedias();
      const media = mediasArray.find((m) => m.imdbID === req.params.id);
      if (media) {
        const newReview = {
          ...req.body,
          _id: uniqid(),
          createdAt: new Date(),
          elementId: media.imdbID,
        };
        media.Reviews.push(newReview);
        await writeMedias(mediasArray);
        res.send(newReview._id);
      } else {
        next(createHttpError(404, `media with id ${req.params.id} not found`));
      }
    } catch (error) {
      next(error);
    }
  }
);

export default mediasRouter;
