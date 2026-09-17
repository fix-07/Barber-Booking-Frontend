import api, { extractError } from "../api/axios";
import * as types from "../actionTypes";

export const submitReview =
  (bookingId, rating, comment, onSuccess) => async (dispatch) => {
    dispatch({ type: types.REVIEW_SUBMIT_REQUEST });
    try {
      const { data } = await api.post("/reviews", { bookingId, rating, comment });
      dispatch({ type: types.REVIEW_SUBMIT_SUCCESS, payload: data });
      if (onSuccess) onSuccess();
    } catch (error) {
      dispatch({ type: types.REVIEW_SUBMIT_FAILURE, payload: extractError(error) });
    }
  };

export const fetchMyReviews = () => async (dispatch) => {
  dispatch({ type: types.MY_REVIEWS_REQUEST });
  try {
    const { data } = await api.get("/reviews/mine");
    dispatch({ type: types.MY_REVIEWS_SUCCESS, payload: data.reviews });
  } catch (error) {
    dispatch({ type: types.MY_REVIEWS_FAILURE, payload: extractError(error) });
  }
};

export const clearReviewFeedback = () => ({ type: types.REVIEW_CLEAR_FEEDBACK });
