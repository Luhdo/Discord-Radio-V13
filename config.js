require("dotenv").config();

module.exports = {
  channelId: "",
  token: process.env.token,
  bots: {
    custom: {
      stream: "",
      type: "",
    },
    javan: { stream: "http://www.radiofaaz.com:8000/radiofaaz", type: "Javan" },
    lofi: { stream: "http://stream.laut.fm/lofi", type: "Lofi" },
    pop: {
      stream: "https://streams.ilovemusic.de/iloveradio3.mp3",
      type: "Pop",
    },
  },
  activities: ["AVIORA RADIO", "Coded By : Dragon,Ludho"],
};
