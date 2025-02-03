import { google } from "googleapis";

const SPREADSHEETS = {
  MEMBERS: {
    id:
      process.env.GOOGLE_SPREADSHET_ID_MEMBERS ??
      "1Fb61_XB2RzcPUiRWTgczIOEWMKXED3h_rXZhkuxgvWA",
    range: "A:E",
  },
  EVENTS: {
    id:
      process.env.GOOGLE_SPREADSHET_ID_EVENTS ??
      "12PbQkOHC7SsA9TsTjj4zW2k10pzGI1AVxIOtfR7fQMc",
    range: "A:F",
  },
};

export const getSpreadsheet = async (type) => {
  const auth = await google.auth.getClient({
    projectId: process.env.GOOGLE_PROJECT_ID ?? "tlcc-sms-campaign",
    credentials: {
      type: process.env.GOOGLE_TYPE ?? "service_account",
      project_id: process.env.GOOGLE_PROJECT_ID ?? "tlcc-sms-campaign",
      private_key_id:
        process.env.GOOGLE_PRIVATE_KEY_ID ??
        "c418f301249e1671144477a81a7c3a99f873c72d",
      private_key:
        process.env.GOOGLE_PRIVATE_KEY ??
        "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC8mMqnwgYCzlt9\nJ5Ohl2K60P35DK/LcE7F9fhqR/bAjGJtihyVYpP/invk2C1DzI6sHCclviIkuUHj\nUNQaBq1nWx5DLshCMZLkFyuam0Ua9xdykkmquKYBPGkMTqujeMuPrk+thJ7ymeuq\n/bQLSJzcXToMzllwA3RldGdR8yZhfaPtuL4zPwUjq0ahIxXwbW8LqG0fu7nLpBno\ntfMekkmP7yum89ZCv4mJtrcmpXATO1edso2Ms8I79UA6iTLHxqi1NW7oPbiEjVyU\neRqPR8KzPwUVzRykD0nnvi4lQrqOOnOyJjTbBTiPcdK8iAZPwJzNnIH80cjklLq6\n2InuLBWLAgMBAAECggEAAgMmna6Hkp3pDi0sHETrEGbeGoEXyUcvrRObKduCtt1r\nglkn/9RqKsGrhGMIpydzmeYo0d0vT1oXxpwN0AlHS0nvbAAXD0ljCPEXzaYlYp4W\n3fVcimhV90s6ckJxuPAUSoAtous+P6eymjgaDYNQd7OlfutNdVzftcs8Kp+uo7Ok\nOvJXlYn7r98Vz+4b7u6NDCJIXU3FU8So4A4ZyhwP7O3m5AQ6fCnuxbFH81Kr3fJZ\n0FWcAXD1rL4qFdx04OH919dq7rDSPdjzbyRqmHUvTUCvSqHs7abtmUwPY2rvva+1\nQJG7jC8gekQhihwdlvt3XlGf8x1+luAkoxsVC9D7wQKBgQDzUoQbw1ctVRnnJRuQ\nN3Dn3axwrpfMFZVqc+6AuEoULpIoFZAaHZGXPsgKIPczY4mvVlkWjlQ4Iq2fKoT7\nK6w/CxvD1SJ+bSigy10wHNsQ1pKnBjQNWyv76ntsK6ouHZXXzMDo3BBL0kzZPJ8I\nmKXmUPXUJdRJm0GwuwwYzNLQOQKBgQDGbFXr1Sw4TzeQCU3czgrpxkI6GOUx+TlQ\n8Rf6YGmLJkCXTOLivbinNs+Ws8fT0tNs/JxvfJ87EI1qmt4Sgo6yvqwn1wYeORqD\nTmwWMQHiF8kwhAlP3z0sF8+enybEqDmQvsL5bBKAqeJ7rLMvb1zQdV1tqzIfkSTB\nuIvSDKML4wKBgQDvIH4SptQLCiKNxisjfUjppjIs/3jRKbkQyGRxfivXT7l1yVM4\nRyzo/dssER/AEiei+HJPN4tPK82Dqg7MpSv/PRSJTfI7W13dQF8RxJoKH0Y6/V60\nbZB5YATx1qvF7G9xiJlhf7xIN6IssGX+1b3c7l3Zo1/RAtL5M6n8yXa5CQKBgF8M\nDAhg38LFZ4cufca0SBP9bUHpJPjQOj1kj6jWwBfwpeYT5WbZnHc00TGOQr1b8vz0\n8HaTCq8/WY5kStYxBevnXA3leT/G+MVHLo1ewlksLap4xQEmnWXergx8jhSLxK9q\nQXk65I4PUrcNXfPt81bDsZJT/DmUzDejkA55ES0jAoGAa1Q1OonGSCKLvLqwADdY\nY0cqr6BDU20oRgYk83i1ZHlMdt23myXTRRfTUDSc3YZayzl7inGf/DlC1HInQaoN\nz/KH37FBH+aC6kBp9A19yFuhwa2zBZvnWS7q0+XIxIFil2Hmpcb2QVDQ9mX5NY61\nSM6JuIc4kw7wDJh4eLJdudk=\n-----END PRIVATE KEY-----\n",
      client_email:
        process.env.GOOGLE_CLIENT_EMAIL ??
        "tlcc-sms-campaign@tlcc-sms-campaign.iam.gserviceaccount.com",
      universe_domain: process.env.GOOGLE_UNIVERSE_DOMAIN ?? "googleapis.com",
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const authSheets = google.sheets({ version: "v4", auth });

  const response = await authSheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEETS[type].id,
    range: SPREADSHEETS[type].range,
  });

  const values = response.data.values || [];

  switch (type) {
    case "MEMBERS":
      return values
        .slice(1)
        .map(([title, firstName, lastName, phoneNumber, isWorker]) => ({
          title,
          firstName,
          lastName,
          phoneNumber,
          isWorker,
        }));
    case "EVENTS":
      return values
        .slice(1)
        .map(
          ([service, date, startTime, recurring, dayOfTheWeek, frequency]) => ({
            service,
            date,
            startTime,
            recurring,
            dayOfTheWeek,
            frequency,
          })
        );
    default:
      throw new Error(`Unhandled action: ${type}`);
  }
};
