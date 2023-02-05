import User from "../model/User.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const JWT_SECRET_KEY = "MyKey";
// this is fully secretkey which is used to encode the token, and by this secret key only we can decode the information as well(this is not accessed by any temmates and you)
//We will just store this secretkey in the environment variable by creating a dotenv file

// middleware for registering an user.
const signup = async (req, res, next) => {
  const { name, email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (error) {
    console.log(error);
  }
  if (existingUser) {
    return res.status(400).json({ message: "User already exists." });
  }

  const hashedPassword = crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");

  const user = new User({
    name,
    email,
    password: hashedPassword,
  });
  try {
    await user.save();
  } catch (error) {
    console.log(error);
  }
  return res.status(201).json({ message: user });
};

// middleware for authenticate the user
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    let existingUser = await User.findOne({ email: email });

    if (!existingUser) {
      res.status(400);
      throw new Error("User not found!");
    }
    const passwordMatch = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    if (passwordMatch !== existingUser?.password)
      throw new Error("Incorrect password");
    const token = jwt.sign({ id: existingUser?._id }, JWT_SECRET_KEY, {
      expiresIn: "1hr",
    });
    return res
      .status(200)
      .json({ message: "Successfully logged in", user: existingUser, token });
  } catch (error) {
    next(error);
  }
};

// middleware for verifying the token

const verifyToken = async (req, res, next) => {
  const headers = req.headers[`authorization`];
  const token = headers.split(" ")[1];
  // here we will split the headers with spaces and we will access the first number index from there
  // here we need to access the token, it's a 0 index(it's a first) this will split the string into arrays and we are now sending the arrays at between the places. It will be acted as a 2 arrays (bearer and token) and we are extracting the first index elements and now we have the token

  //verify the token
  if (!token) {
    return res.status(404).json({ message: "No token found!" });
  }
  jwt.verify(String(token), JWT_SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(400).json({ message: "Invalid Token" });
    }
    console.log(user.id);
  });
  next();
};

// get the details of the user

const getUser = async (req, res, next) => {
  const userId = req.id;
  let user;
  try {
    user = await User.findById(userId, "-password");
  } catch (error) {
    return new Error(error);
  }
  if (!user) {
    return res.status(404).json({ message: "User Not Found!" });
  }
  return res.status(200).json({ user });
};

export { signup, login, verifyToken, getUser };
