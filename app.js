const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

const users = [];

app.get("/login", (req, res, next) => {
  res.send(
    '<html><body><form action="/login" method="POST"><input type="text" name="username" /><button type="submit">Login</button></form></body></html>'
  );
});

app.post("/login", (req, res, next) => {
  const username = req.body.username;
  if (username) {
    users.push(username);
    res.redirect(`/?username=${username}`);
  } else {
    res.redirect("/login");
  }
});

app.get("/", (req, res, next) => {
  const username = req.query.username;

  if (!username) {
    res.redirect("/login");
    return;
  }

  fs.readFile("messages.txt", "utf8", (err, data) => {
    if (err && err.code !== "ENOENT") {
      return res.send("<h1>Error reading file</h1>");
    }

    const messages = data
      ? data
          .split("\n")
          .filter((line) => line)
          .map(JSON.parse)
      : [];

    let messagesHtml = messages
      .map((msg) => `<p><strong>${msg.username}:</strong> ${msg.message}</p>`)
      .join("");

    res.send(`
      <html>
        <body>
          <h1>Welcome, ${username}!</h1>
          <form action="/" method="POST">
            <input type="hidden" name="username" value="${username}" />
            <input type="text" name="message" placeholder="Enter your message" />
            <button type="submit">Send</button>
          </form>
          ${messagesHtml}
        </body>
      </html>
    `);
  });
});

app.post("/", (req, res, next) => {
  const username = req.body.username;
  const message = req.body.message;

  if (!username || !message) {
    res.redirect("/login");
    return;
  }

  const newMessage = { username, message };

  fs.appendFile("messages.txt", JSON.stringify(newMessage) + "\n", (err) => {
    if (err) {
      return res.send("<h1>Error writing file</h1>");
    }
    res.redirect(`/?username=${username}`);
  });
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
