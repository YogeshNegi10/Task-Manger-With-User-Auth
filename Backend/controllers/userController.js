import bcrypt from "bcrypt";
import { User } from "../modals/userModal.js";
import sendCookie, { sendEmail } from "../utils/features.js";
import ErrorHandler from "../utils/error.js";

export let actualPassword = "";

// Function for creating User..

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return next(new ErrorHandler("All fields are required.", 404));

    let user = await User.findOne({ email });

    if (user) return next(new ErrorHandler("Email Already Exists!", 404));

    const hashpassword = await bcrypt.hash(password, 10);

    user = await User.create({
      name,
      email,
      password: hashpassword,
      emailVerified: false,
      otp: "",
      otpExpiresAt: "",
    });

    actualPassword = password;

    sendCookie(user, res, "Registered Successfully!", 201);
  } catch (error) {
    next(error);
  }
};

// User Login function..

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return next(new ErrorHandler("All fields are required.", 404));

    const user = await User.findOne({ email });

    if (!user) {
      return next(new ErrorHandler("Register First Please!", 404));
    } else {
      const IsMatched = await bcrypt.compare(password, user.password);

      if (!IsMatched)
        return next(new ErrorHandler("Incorrect Email Or Password!", 404));

      if (IsMatched) {
        actualPassword = password
      }
      sendCookie(user, res, `Welcome Back, ${user.name}`, 200);
    }
  } catch (error) {
    next(error);
  }
};

// LogOut Function...

export const logOut = (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out Sucessfully!",
  });
};

// To Get my Details...

export const getMyDetails = (req, res) => {
  res.status(200).json({
    sucess: true,
    message: "User Fetched Successfully!",
    user: req.user,
  });
};

// To Send otp for Email Verification....

export const sendOtp = async (req, res, next) => {
  const {email} =  req.user
  try {
    const user = await User.findOne({ email });

    if (!user) return next(new ErrorHandler("Email does not exits", 404));

    const OneTimePassword = Math.floor(1000 + Math.random() * 9000);

    const OtpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = OneTimePassword;
    user.otpExpiresAt = OtpExpiry;

    user.save();

    res.status(200).json({
      status: true,
      message: "Otp has been sent to your Email",
    });

    sendEmail(OneTimePassword, email);
    console.log(OneTimePassword);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const verifiOtp = async (req, res,next) => {
  const { OneTimePassword} = req.body;
  console.log(OneTimePassword)
  const { id } = req.user;

  if (!OneTimePassword) return next(new ErrorHandler("Otp is required!", 404));

  try {
    const user = await User.findById(id);

    if (!user) return next(new ErrorHandler("User does not exist! ", 404));


    if(user.otp !== OneTimePassword)  return next(new ErrorHandler("Wrong Otp entered! ", 404));


    if (user.otp === OneTimePassword && user.otpExpiresAt > Date.now()) {

      user.emailVerified = true;
     
      user.otp = "";
      user.otpExpiresAt = null;

      user.save();

      res.status(200).json({
        status: true,
        message: "Email Verified successfully",
      });
    } else {
      res.json({
        status: false,
        message: "otp expired!",
      });
    }
  } catch (error) {
    console.log(error);
  }
};
