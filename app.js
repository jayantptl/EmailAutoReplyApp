require("dotenv").config();                 // configuring .env
const cron = require("node-cron");          // to schedule tasks
const { google } = require("googleapis");   // to use google apis

// oAuth2Client is used to handle OAuth 2.0 authentication for accessing the Gmail API.
const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// setting the credentials for gmail login using oAuth2Client
oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

/* onceRepliedUsers keep track of the emails that have been replied to make sure that 
no double replies are sent to any email at any point. 
Every email that qualifies the criterion should be replied back with one and only one auto reply */
const onceRepliedUsers = new Set();

//1. checks for new emails and sends replies .
async function checkUnreadEmailsAndReply() {
  try {
    // login into user's gmail using oAuth2Client
    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

    // Get the list of unread messages.
    const res = await gmail.users.messages.list({
      userId: process.env.MY_EMAIL,
      q: "is:unread",
    });
    const messages = res.data.messages;

    if (messages && messages.length > 0) {
      // Fetch the complete message details.
      for (const message of messages) {
        const email = await gmail.users.messages.get({
          userId: process.env.MY_EMAIL,
          id: message.id,
        });

        const from = email.data.payload.headers.find(
          (header) => header.name === "From"
        );
        const toHeader = email.data.payload.headers.find(
          (header) => header.name === "To"
        );
        const Subject = email.data.payload.headers.find(
          (header) => header.name === "Subject"
        );

        //who sends email extracted
        const From = from.value;

        //who gets email extracted
        const toEmail = toHeader.value;

        //subject of unread email
        const subject = Subject.value;

        console.log("Email Came From : ", From);

        //check if the user already been replied to
        if (onceRepliedUsers.has(From)) {
          console.log("Already replied to : ", From);
          continue;
        }

        // 2.send replies to Emails that have no prior replies
        // Check if the email has any replies.
        const thread = await gmail.users.threads.get({
          userId: process.env.MY_EMAIL,
          id: message.threadId,
        });

        //isolated the email into threads
        const replies = thread.data.messages.slice(1);

        if (replies.length > 0) {
          console.log("Already replied to (thread): ", From);
          continue;
        }

        // Reply to the email.
        await gmail.users.messages.send({
          userId: process.env.MY_EMAIL,
          requestBody: {
            raw: await createEncodedReply(toEmail, From, subject),
          },
        });

        // Add a label to the email.
        const labelName = "onLeave";
        await gmail.users.messages.modify({
          userId: process.env.MY_EMAIL,
          id: message.id,
          requestBody: {
            addLabelIds: [await createEmailLabel(labelName)],
          },
        });

        console.log("Sent Reply to Email:", From);

        //Add the user to replied users set
        onceRepliedUsers.add(From);
      }
    }
  } catch (error) {
    console.error("Error occurred: ", error.message);
  }
}

// helper function to create email raw reply in encoded form
async function createEncodedReply(from, to, subject) {
  const emailContent = `From: ${from}\nTo: ${to}\nSubject: ${subject}\n\nHay, Thanks for your message. Actually, I'm unavailable right now, but will respond as soon as possible...`;
  const base64EncodedEmail = Buffer.from(emailContent)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return base64EncodedEmail;
}

// 3.add a Label to the email and move the email to the label
async function createEmailLabel(labelName) {
  const gmail = google.gmail({ version: "v1", auth: oAuth2Client });
  // Check if the label already exists.
  const res = await gmail.users.labels.list({ userId: process.env.MY_EMAIL });
  const labels = res.data.labels;

  const existingLabel = labels.find((label) => label.name === labelName);
  if (existingLabel) {
    return existingLabel.id;
  }

  // Create the label if it doesn't exist.
  const newLabel = await gmail.users.labels.create({
    userId: process.env.MY_EMAIL,
    requestBody: {
      name: labelName,
      labelListVisibility: "labelShow",
      messageListVisibility: "show",
    },
  });

  return newLabel.data.id;
}

// helper function to generate random interval between 45 and 120 seconds
function getRandomInterval() {
  return Math.floor(Math.random() * (120 - 45 + 1) + 45);
}

// Scheduling the emails checking and replying task at random intervals using cron-jobs
cron.schedule(`*/${getRandomInterval()} * * * * *`, async () => {
  console.log("Checking For New Emails At :", new Date());
  await checkUnreadEmailsAndReply();
  console.log(".......New Emails Checked and Replyed.........");
  console.log("\n");
});

console.log("App Started and Email Checking is Scheduled", "\n");


