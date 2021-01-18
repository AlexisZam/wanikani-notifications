import axios from "axios";
import fs from "fs";
import nodemailer from "nodemailer";
import winston from "winston";

const { API_TOKEN, USER, PASS } = process.env;
const MAIL_SUBJECT = "WaniKani reviews are available";
const SUBJECT_IDS_PATH = "subjectIds.log";

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      ({ level, message, timestamp }) => `${timestamp} ${level}: ${message}`
    )
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

const getSubjectIds = async () => {
  const response = await axios({
    url: "https://api.wanikani.com/v2/summary",
    headers: { Authorization: `Bearer ${API_TOKEN}` },
  });
  const subjectIds = response.data.data.reviews[0].subject_ids;
  logger.info(`Subject ids ${JSON.stringify(subjectIds)}`);
  return subjectIds;
};

const reviewsAreAvailable = (previous, current) => {
  const isSubset = (s, t) => s.every((element) => t.includes(element));
  return (
    (!previous.length || !isSubset(previous, current)) &&
    !isSubset(current, previous)
  );
};

const sendMail = async () => {
  const mail = nodemailer.createTransport({
    service: "gmail",
    auth: { user: USER, pass: PASS },
  });
  const info = await mail.sendMail({ to: USER, subject: MAIL_SUBJECT });
  logger.info(`Sent message info ${JSON.stringify(info)}`);
};

(async () => {
  if (!fs.existsSync(SUBJECT_IDS_PATH))
    fs.writeFileSync(SUBJECT_IDS_PATH, JSON.stringify([]));
  const subjectIds = await Promise.all([
    fs.promises.readFile(SUBJECT_IDS_PATH),
    getSubjectIds(),
  ]);
  fs.promises.writeFile(SUBJECT_IDS_PATH, JSON.stringify(subjectIds[1]));
  subjectIds[0] = JSON.parse(subjectIds[0]);
  if (reviewsAreAvailable(...subjectIds)) sendMail();
})();

export default reviewsAreAvailable;
