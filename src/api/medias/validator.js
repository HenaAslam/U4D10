import { checkSchema, validationResult } from "express-validator";
import createHttpError from "http-errors";

const mediaSchema = {
  title: {
    in: ["body"],
    isString: {
      errorMessage: "Title is a mandatory field and needs to be a string",
    },
    isLength: {
      errorMessage: "title can't be empty",

      options: { min: 1 },
    },
  },
  year: {
    in: ["body"],
    isString: {
      errorMessage: "Year is a mandatory field and needs to be a string",
    },
    isLength: {
      errorMessage: "year can't be empty",

      options: { min: 1 },
    },
  },
  type: {
    in: ["body"],
    isString: {
      errorMessage: "type is a mandatory field and needs to be a string",
    },
    isLength: {
      errorMessage: "type can't be empty",

      options: { min: 1 },
    },
  },
  poster: {
    in: ["body"],
    isString: {
      errorMessage: "poster is a mandatory field and needs to be a string",
    },
  },
};

export const checkMediaSchema = checkSchema(mediaSchema);

export const triggerBadRequest = (req, res, next) => {
  const errors = validationResult(req);

  console.log(errors.array());

  if (errors.isEmpty()) {
    next();
  } else {
    next(
      createHttpError(400, "Errors during media validation", {
        errorsList: errors.array(),
      })
    );
  }
};