import {
  addDays,
  subHours,
  startOfDay,
  getDay,
  format,
  isAfter,
  isBefore,
  parse,
} from "date-fns";
import request from "request";

const now = new Date();

// Helper to check if two dates are the same day
const isSameDay = (date1, date2) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

// Utility to get the next date for weekly recurring events
const getNextWeeklyDate = (dayOfTheWeek) => {
  const daysOfWeek = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  const today = startOfDay(now);
  const targetDay = daysOfWeek.indexOf(dayOfTheWeek.toLowerCase());
  const currentDay = now.getDay();

  if (dayOfTheWeek === daysOfWeek[now.getDay()]) return now;

  const daysToAdd = (targetDay - currentDay + 7) % 7;
  return addDays(today, daysToAdd);
};

// Utility to get the next date for monthly recurring events
const getNextMonthlyDate = (nthOccurrence) => {
  const today = startOfDay(now);
  const currentMonth = now.getMonth();
  const year = now.getFullYear();
  const weekDays = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  const [nth, dayName] = nthOccurrence.split(" ");
  const targetDay = weekDays.indexOf(dayName.toLowerCase());

  if (targetDay === -1) {
    throw new Error("Invalid day of the week");
  }

  let date = startOfDay(new Date(year, currentMonth, 1));
  let count = 0;

  while (date.getMonth() === currentMonth) {
    if (getDay(date) === targetDay) {
      count++;

      const isTargetOccurrence =
        (nth === "last" && addDays(date, 7).getMonth() !== currentMonth) ||
        `${count}st` === nth ||
        `${count}nd` === nth ||
        `${count}rd` === nth ||
        `${count}th` === nth;

      if (isTargetOccurrence && isSameDay(today, date)) return today;
      if (isTargetOccurrence) return date;
    }
    date = addDays(date, 1);
  }

  throw new Error("No valid occurrence found for this month");
};

// Utility to format time with AM/PM
const formatTime = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;
  return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
};

const composeSMS = (event, member) => {
  const formattedTime = formatTime(event.startTime);
  return `Greetings ${member.title} ${member.firstName}, this is to remind you that our ${event.service} holds today by ${formattedTime}. Come expectant and invite someone. God bless you.`;
};

export const sendSMS = async (message, phoneNumbers) => {
  try {
    const data = {
      to: phoneNumbers,
      from: process.env.TERMII_SENDER_ID,
      sms: message,
      type: process.env.TERMII_SMS_TYPE,
      api_key: process.env.TERMII_API_KEY,
      channel: process.env.TERMII_SMS_CHANNEL,
    };
    const options = {
      method: "POST",
      url: "https://v3.api.termii.com/api/sms/send",
      headers: {
        "Content-Type": ["application/json", "application/json"],
      },
      body: JSON.stringify(data),
    };
    request(options, function (error, response) {
      if (error) throw new Error(error);
      console.log(response.body);
    });
  } catch (error) {
    console.error("Failed to send SMS:", error);
  }
};

export const sendPersonalizedSMS = async (event, members) => {
  try {
    for (const member of members) {
      const message = composeSMS(event, member);
      await sendSMS(message, [member.phoneNumber]);
      console.log(
        "SMS has been sent to ",
        member.firstName,
        `(${member.phoneNumber})`
      );
    }
  } catch (error) {
    console.error("Failed to send personalized SMS:", error);
  }
};

export const isToday = (date) => {
  if (!date) return false;
  return date.toISOString().split("T")[0] === now.toISOString().split("T")[0];
};

export const isNowWithinOneHourOfEventTime = (startTime) => {
  const currentTime = format(now, "HH:mm");

  const nowTime = parse(currentTime, "HH:mm", new Date());
  const eventTime = parse(startTime, "HH:mm", new Date());

  const oneHourBeforeEvent = subHours(eventTime, 1);

  return isAfter(nowTime, oneHourBeforeEvent) && isBefore(nowTime, eventTime);
};

export const getPhoneNumbers = (members) => {
  return members.map((member) => member.phoneNumber);
};

// Process events and send personalized SMS
export const processEvents = async (events, members) => {
  events.forEach(async (event) => {
    let notificationTime = null;
    if (event.recurring === "TRUE") {
      if (event.frequency === "weekly") {
        notificationTime = subHours(
          getNextWeeklyDate(event.dayOfTheWeek || ""),
          2
        );
      } else if (event.frequency === "monthly") {
        notificationTime = subHours(
          getNextMonthlyDate(event.dayOfTheWeek || ""),
          2
        );
      }
    } else if (event.date) {
      notificationTime = new Date(event.date);
    }

    if (!isToday(notificationTime)) return;

    if (isNowWithinOneHourOfEventTime(event.startTime)) {
      await sendPersonalizedSMS(event, members);
    }
  });
};
