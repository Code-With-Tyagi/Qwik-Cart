import app from "./src/app.js";
import connectDB from "./src/db/db.js";
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is listening to port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  });