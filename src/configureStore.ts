import { createStore, applyMiddleware } from "redux";
import { rootReducer } from "./store";
import logger from "redux-logger";

export default function configureStore() {
  return createStore(
    rootReducer
    // applyMiddleware(logger)
    // @ts-ignore
    // window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  );
}
