require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const ObjectID = require("mongodb").ObjectID;
const nodemailer = require("nodemailer");
//imported handle bars here
const hbs = require("nodemailer-express-handlebars");
const { restart } = require("nodemon");
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));


mongoose.connect(process.env.MONGODB_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});
const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error"));
db.once("open", function callback() {
  console.log("Database is up and running");
});
let transporter = nodemailer.createTransport({
  // host: "smtp.gmail.com",
  // port: 465,
  // secure: false,
  service: "OUTLOOK",
  auth: {
    user: process.env.OUTLOOK_USER,
    pass: process.env.OUTLOOK_PASSWORD,
  },
});
// added view for template here
// transporter.use(
//   "compile",
//   hbs({
//     viewEngine: "express-handlebars",
//     viewPath: "./views/",
//   })
// );

// to param is who we are going to send the email to
async function sendEmail(to, subject, text, html) {
  // configuration

  try {
    let info = await transporter.sendMail({
      // from: process.env.GMAIL_USER,
      from: process.env.OUTLOOK_USER,
      to,
      subject,
      text,
      html,
    
      //added attachment here
     attachments: [
         {path: './logo.jpg', cid: 'logo.jpg'} 
     ]
    });

    console.log("Message sent: %s", info.MessageId);
  } catch (error) {
    console.log(error);
  }
}

app.put("/evaluation/:id", async (req, res) => {
  const id = req.params.id;
  const body = req.body;
  const x = await db
    .collection("evaluations")
    .updateOne(
      { _id: new ObjectID(id) },
      { $set: { name: body.name, email: body.email } }
    );
  res.json(x);
});

app.get("/", async (req,res) => {
  res.redirect("https://gothamevaluation.com")
})

app.get("/evaluations", async (req, res) => {
  const evaluations = await db.collection("evaluations").find({}).toArray();
  res.json(evaluations);
});

app.get("/evaluation/:id", async (req, res) => {
  const id = req.params.id;
  const user = await db
    .collection("evaluations")
    .find({ _id: new ObjectID(id) })
    .toArray();
  res.json(user);
});

app.delete("/evaluation/:id", async (req, res) => {
  const id = req.params.id;
  const x = await db
    .collection("evaluations")
    .deleteOne({ _id: new ObjectID(id) });
  res.json("User deleted");
});

app.get("/", async (req, res) => {
  res.json("Hello World");
});

app.post("/user_info", async (req, res) => {
  const form = req.body;
  const x = await db.collection("user_info").insertOne(form);
  console.log(form);
  res.json("user added successfully");
});

app.post("/evaluations", async (req, res) => {
  const athleteResult = req.body;
  const level = req.body.level;
  const email = req.body.email;
  const athleteName = req.body.athleteName;
  const parentName = req.body.parentName;
  const date = req.body.date;

  console.log("we are here");

  try {
    const x = await db.collection("evaluations").insertOne(athleteResult);
    // email sent to the user
    // * attempt to pass in template here next
    await sendEmail(
      email,
      "class assessment",
      `congrats your level assessment is ${level}`,
      // this seems to work by embedding the images, refer to the send method above i think i need the path in order for it to identify the file
      `<img src = "cid:logo.jpg" width="800" height="250"/> <h1 style=" color: #6A3490; font-family: 'Arial Black'; font-size: 16px; margin: 0; text-transform: uppercase;">Hey ${parentName}, great news! ${athleteName} has qualified for our ${level} level program! You Got this!<br>Because we got YOU!<br><br><br></h1><h3 style=" color: #6A3490; font-family: 'Arial Black';">Gotham Gymnastics</h3><h4>phone:(718) 722-7211</h4><h4>email:info@gothamgymnastics.com</h4><h4>315 Douglass St. Brooklyn, NY</h4><h4>11217, USA</h4><h4><a href="www.gothamgymnastics.com">www.gothamgymnastics.com</h4>`,
      // `<img src = "cid:logo.png" width="200" height="200"/> <h1>Hello guys please see this link ${level}</h1>`
    );
    // email sent to the front desk
    await sendEmail(
      "evaluation@gothamgymnastics.com",
      "class assessment",
      `<img src = "cid:logo.jpg" width="800" height="250"/> <h2 style=" color: #6A3490; font-family: 'Arial Black'; font-size: 16px; margin: 0; text-transform: uppercase;">On ${date}, ${athleteName} was evaluated to be ${level} level</h2>`,
      `<img src = "cid:logo.jpg" width="800" height="250"/> <h2 style=" color: #6A3490; font-family: 'Arial Black'; font-size: 16px; margin: 0; text-transform: uppercase;">On ${date}, ${athleteName} was evaluated to be ${level} level</h2>`
      // `<div>student is in level ${level}</div>`
    );
  } catch (error) {
    console.log(error);
  }

  console.log(athleteResult);
  res.json("evaluated successfully");
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server is running on port ${port}...`));
