import * as types from "../actionTypes";

const initialState = {
  myReviews: [],
  isLoadingMyReviews: false,
  isSubmitting: false,
  error: null,
  message: null,
};

const reviewReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.REVIEW_SUBMIT_REQUEST:
      return { ...state, isSubmitting: true, error: null, message: null };

    case types.REVIEW_SUBMIT_SUCCESS:
      return { ...state, isSubmitting: false, message: action.payload.message };

    case types.REVIEW_SUBMIT_FAILURE:
      return { ...state, isSubmitting: false, error: action.payload.message };

    case types.MY_REVIEWS_REQUEST:
      return { ...state, isLoadingMyReviews: true };

    case types.MY_REVIEWS_SUCCESS:
      return { ...state, isLoadingMyReviews: false, myReviews: action.payload };

    case types.MY_REVIEWS_FAILURE:
      return { ...state, isLoadingMyReviews: false };

    case types.REVIEW_CLEAR_FEEDBACK:
      return { ...state, error: null, message: null };

    default:
      return state;
  }
};

export default reviewReducer;
