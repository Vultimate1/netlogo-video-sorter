const express = require("express");
const app = express();
const fp = require("file").promises;
const path = require("path");

const REGISTRATION_API = process.env.REGISTRATION_API_URL; // set to the repo of registration repo (/netlogo-survey-registration)

const hasCompletedSurvey = (email, res) => {
  try {
    const filePath = path.join(__dirname, "public", "/reg_codes.csv");
    const csv = await fs.readFile(filePath, "utf8");
    return csv.includes(email);
  } catch (err) {
    return res.json({ allowed: true, reason: "Could not reach file, allow in user anyway." });
  }
};

app.get("/api/survey/check-access", async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ allowed: false, reason: "No email provided" });

  const regRes = await fetch(`${REGISTRATION_API}/api/registrants/:email`);
  if (regRes.status === 404) {
    return res.json({ allowed: false, reason: "Not registered" });
  }

  const alreadyDone = await hasCompletedSurvey(email, res); // survey-server's own tracking
  if (alreadyDone) {
    return res.json({ allowed: false, reason: "Already completed" });
  }

  res.json({ allowed: true });
});
