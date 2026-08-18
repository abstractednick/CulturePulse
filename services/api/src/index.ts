import { createApp } from "./app.js";
import { store } from "./data/store.js";

const port = Number(process.env.PORT ?? 4000);
store.tickStatuses();
const app = createApp();

app.listen(port, () => {
  console.log(`CulturePulse API listening on http://localhost:${port}`);
  console.log("Demo logins → maya@culturepulse.app / arjun@culturepulse.app / admin@culturepulse.app  (pulse123)");
});
