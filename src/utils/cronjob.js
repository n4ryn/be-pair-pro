const cron = require("node-cron");
const ConnectionRequest = require("../models/connectionRequest");
const { subDays, startOfDay, endOfDay } = require("date-fns");
const sendEmail = require("./sendEmail");

cron.schedule("0 8 * * *", async () => {
  try {
    const yesterday = subDays(new Date(), 1);
    console.log(yesterday);

    const yesterdayStartOfDay = startOfDay(yesterday);
    const yesterdayEndOfDay = endOfDay(yesterday);
    console.log(yesterdayStartOfDay, yesterdayEndOfDay);

    // Send email to all users who got request the previous day
    const pendingRequests = await ConnectionRequest.find({
      status: "interested",
      createdAt: {
        $gte: yesterdayStartOfDay,
        $lt: yesterdayEndOfDay,
      },
    }).populate("fromUserId toUserId");

    const listOfEmails = [
      ...new Set(pendingRequests.map((req) => req.toUserId.emailId)),
    ];

    for (const email of listOfEmails) {
      try {
        const res = await sendEmail.run(
          "You have new connection requests 🙌",
          `Hi ${email}, you have new connection requests, please login to your account to review them.`
        );

        console.log(res);
      } catch (error) {
        console.log(error);
      }
    }
  } catch (error) {
    console.log(error);
  }
});
