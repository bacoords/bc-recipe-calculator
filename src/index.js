import { createRoot } from "@wordpress/element";
import App from "./components/App";
import "./style.scss";

// Wait for DOM to be ready
document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("bc-recipe-calculator");

  if (container) {
    const root = createRoot(container);
    root.render(<App />);
  }
});
