/* @refresh reload */
import { render } from "solid-js/web";

import "./assets/styles.css";
import App from "./App";

render(() => <App />, document.getElementById("root") as HTMLElement);
