import express from "express";
import mongoose from "mongoose";
import routes from "./routes/user-routes.js";

const app = express();
app.use(express.json());
app.use("/api", routes);
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

mongoose.set("strictQuery", false);
mongoose
  .connect(
    "mongodb+srv://admin:zY9QhkY02UrvFl0R@cluster0.fpxs4bm.mongodb.net/auth?retryWrites=true&w=majority"
  )
  .then(() => {
    app.listen(5000);
    console.log("Database connected!");
  })
  .catch((err) => console.log(err));
