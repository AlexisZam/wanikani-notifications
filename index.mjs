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

(async () => {
  let data;

  if (!fs.existsSync(SUBJECT_IDS_PATH)) {
    data = JSON.stringify([-1]);
    fs.writeFileSync(SUBJECT_IDS_PATH, data);
  }

  data = fs.readFileSync(SUBJECT_IDS_PATH);
  const previousSubjectIds = JSON.parse(data);
  logger.info(`Previous subject ids ${data}`);

  const response = await axios({
    url: "https://api.wanikani.com/v2/summary",
    headers: { Authorization: `Bearer ${API_TOKEN}` },
  });
  const currentSubjectIds = response.data.data.reviews[0].subject_ids;
  data = JSON.stringify(currentSubjectIds);
  logger.info(`Current subject ids ${data}`);

  if (
    currentSubjectIds.length &&
    previousSubjectIds.some((element) => !currentSubjectIds.includes(element))
  ) {
    fs.writeFileSync(SUBJECT_IDS_PATH, data);

    const mail = nodemailer.createTransport({ sendmail: true });
    const info = await mail.sendMail({ to: MAIL_TO, subject: MAIL_SUBJECT });
    data = JSON.stringify(info);
    logger.info(`Sent message info ${data}`);
  }
})();
