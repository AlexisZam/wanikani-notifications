import axios from "axios";
import fs from "fs";
import nodemailer from "nodemailer";
import winston from "winston";

const { API_TOKEN, MAIL_TO } = process.env;
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

const sendMail = async () => {
  const mail = nodemailer.createTransport({
    sendmail: true,
    path: "/usr/sbin/sendmail",
  });
  const info = await mail.sendMail({ to: MAIL_TO, subject: MAIL_SUBJECT });
  logger.info(`Sent message info ${JSON.stringify(info)}`);
};

(async () => {
  if (!fs.existsSync(SUBJECT_IDS_PATH))
    fs.writeFileSync(SUBJECT_IDS_PATH, JSON.stringify([]));
  const previousSubjectIds = JSON.parse(fs.readFileSync(SUBJECT_IDS_PATH));
  const currentSubjectIds = await getSubjectIds();
  fs.writeFileSync(SUBJECT_IDS_PATH, JSON.stringify(currentSubjectIds));
  if (
    currentSubjectIds.length &&
    (!previousSubjectIds.length ||
      previousSubjectIds.some(
        (element) => !currentSubjectIds.includes(element)
      ))
  )
    sendMail();
})();
