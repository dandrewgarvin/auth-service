const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const bcrypt = require("./lib/bcrypt");
const database = require("./lib/database");

const app = express();

app.use(express.json());
app.use(cors());

app.post("/api/v1/register", async (req, res) => {
  try {
    const { email, password, first_name, last_name } = req.body;

    const user = await database.find(email);

    if (user) {
      throw {
        code: 401,
        msg: "User Already Exists",
      };
    }

    const hashed = await bcrypt.hash(password);

    const newUser = await database.create({
      email,
      password: hashed,
      first_name,
      last_name,
    });

    delete newUser.password;

    const token = jwt.sign(newUser, process.env.JWT_SECRET, {
      expiresIn: 30,
    });

    res.status(200).json({
      success: true,
      error: null,
      data: token,
    });
  } catch (err) {
    res.status(err.code).json({
      success: false,
      error: err.msg,
      data: null,
    });
  }
});

app.get("/api/v1/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await database.find(email);

    if (!user) {
      throw {
        code: 401,
        msg: "Incorrect Email or Password",
      };
    }

    const isCorrect = await bcrypt.compare(password, user.password);

    if (!isCorrect) {
      throw {
        code: 401,
        msg: "Incorrect Email or Password",
      };
    }

    delete user.password;

    const token = jwt.sign(user, process.env.JWT_SECRET, {
      expiresIn: "1 minute",
    });

    res.status(200).json({
      success: true,
      error: null,
      data: token,
    });
  } catch (err) {
    res.status(err.code).json({
      success: false,
      error: err.msg,
      data: null,
    });
  }
});

// every route after this point is considered restricted
app.use("/", (req, res, next) => {
  try {
    const token = req.headers.authorization.replace("Bearer: ", "");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log(
      `user ${decoded.id} has successfully been redirected to ${req.url}`
    );

    next();
  } catch (err) {
    console.log(
      `a user has attempted to access ${req.url} with an invalid token`
    );
    res.status(401).json({
      success: false,
      err,
      data: null,
    });
  }
});

app.get("/api/v1/restricted", (req, res) => {
  try {
    res.status(200).json({
      success: true,
      error: null,
      data: {
        msg: "it all worked!",
      },
    });
  } catch (err) {
    res.status(err.code).json({
      success: false,
      error: err.msg,
      data: null,
    });
  }
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
