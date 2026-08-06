import express from "express";

const app = express();

app.get("/", (req, res) => {
    res.send("FixItNow Backend Running");
});

if (process.env.NODE_ENV !== "production") {
    app.listen(3000, () => {
        console.log("Server running on http://localhost:3000");
    });
}

export default app;