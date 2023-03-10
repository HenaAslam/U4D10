import { checkSchema, validationResult } from "express-validator";
import createHttpError from "http-errors";

const mediaSchema = {
  Title: {
    in: ["body"],
    isString: {
      errorMessage: "Title is a mandatory field and needs to be a string",
    },
    isLength: {
      errorMessage: "title can't be empty",

      options: { min: 1 },
    },
  },
  Year: {
    in: ["body"],
    isString: {
      errorMessage: "Year is a mandatory field and needs to be a string",
    },
    isLength: {
      errorMessage: "year can't be empty",

      options: { min: 1 },
    },
  },
  Type: {
    in: ["body"],
    isString: {
      errorMessage: "type is a mandatory field and needs to be a string",
    },
    isLength: {
      errorMessage: "type can't be empty",

      options: { min: 1 },
    },
  },
  Poster: {
    in: ["body"],
    isString: {
      errorMessage: "poster is a mandatory field and needs to be a string",
    },
  },
};
const reviewSchema = {
  comment: {
    in: ["body"],
    isString: {
      errorMessage: "comment is a mandatory field and needs to be a string",
    },
  },
  rate: {
    in: ["body"],
    isDecimal: {
      errorMessage: "rate is a mandatory field and needs to be a number",
    },
  },
};

export const checkMediaSchema = checkSchema(mediaSchema);
export const checkReviewSchema = checkSchema(reviewSchema);

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
