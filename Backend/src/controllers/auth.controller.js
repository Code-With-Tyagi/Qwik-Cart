import userModel from "../models/user.model.js"
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import OTP from "../services/otp.service.js";
import otpModel from "../models/otp.model.js";
import { sendForgotPasswordMail, sendRegistrationMail } from "../services/email.service.js";

export const registerController = async function (req, res) {
  let { name, email, password } = req.body;

  let alreadyExist = await userModel.findOne({ email });

  if (alreadyExist) {
    return res.status(409).json({
      message: "User already exists"
    })
  }

  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    let registeredUser = await userModel.create({
      name,
      email,
      password: hash,
    });

    const generatedOTP = OTP();
    const hashedOTP = bcrypt.hashSync(generatedOTP, salt);

    const otpDB = await otpModel.create({
      user: registeredUser._id,
      otp: hashedOTP,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      purpose: "REGISTER"
    })

    res.cookie("userId", registeredUser._id);

    await sendRegistrationMail(registeredUser.email, generatedOTP);

    res.status(201).json({
      message: "OTP sent to mail"
    })

  } catch (err) {
    return res.status(500).json({
      message: "Some error occurred!",
      error: err.stack
    });
  }
}

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required.",
      });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: "Email is already verified.",
      });
    }

    const otpDetails = await otpModel.findOne({
      user: user._id,
      purpose: "REGISTER",
    });

    if (!otpDetails) {
      return res.status(404).json({
        message: "OTP not found.",
      });
    }

    // Check OTP expiry
    if (otpDetails.expiresAt < new Date()) {
      await otpModel.findByIdAndDelete(otpDetails._id);

      return res.status(400).json({
        message: "OTP has expired.",
      });
    }

    const isOTPValid = await bcrypt.compare(
      otp,
      otpDetails.otp
    );

    if (!isOTPValid) {
      return res.status(401).json({
        message: "Invalid OTP.",
      });
    }

    // Verify user
    user.isVerified = true;
    await user.save();

    // Delete OTP after successful verification
    await otpModel.findByIdAndDelete(otpDetails._id);

    // Generate JWT
    const token = jwt.sign(
      {
        _id: user._id,
        userEmail: user.email,
        userName: user.name,
        role: user.role,
      },
      process.env.JWT_SECRET
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({
      message: "Email verified successfully.",
      userDetails: user,
    });

  } catch (err) {
    return res.status(500).json({
      message: "Error verifying OTP.",
      error: err.message,
    });
  }
};

export const loginController = async (req, res) => {

  const { email, password } = req.body;

  const isUser = await userModel.findOne({ email });

  if (!isUser) {
    return res.status(404).json({
      message: "User not found! Please register first"
    });
  }

  if (isUser.accountStatus === "DEACTIVE") {
    return res.status(403).json({
      message: "Your Account is deactive. Please reactivate it."
    });
  }

  if (!isUser.isVerified) {
    return res.status(403).json({
      message: "Please verify your email first.",
    });
  }

  const isPass = await bcrypt.compare(
    password,
    isUser.password
  );

  if (!isPass) {
    return res.status(401).json({
      message: "Invalid credentials"
    });
  }

  const token = jwt.sign(
    {
      _id: isUser._id,
      userEmail: isUser.email,
      userName: isUser.name,
      role: isUser.role,
    },
    process.env.JWT_SECRET
  );

  res.cookie("token", token);

  return res.status(200).json({
    message: "User logged in successfully",
    user: isUser
  });

};

export const logoutController = async function (req, res) {
  res.clearCookie("token");
  res.status(200).json({
    message: "Logged out successfully"
  })
}

export const getAllUsers = async function (req, res) {
  let allUsers = await userModel.find({});
  res.status(200).json({
    message: "Users fetched successfully!",
    users: allUsers
  })
}

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await userModel.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 4. Return the fresh database user document
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const forgotPasswordRequest = async (req, res) => {
  try {
    let { email } = req.body;

    if (!email) {
      return res.satus(400).json({
        message: "Email is required"
      })
    }

    let user = await userModel.findOne({ email: email });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      })
    }

    let isAccountActive = user.accountStatus === "ACTIVE";

    if (!isAccountActive) {
      return res.status(400).json({
        message: "Account is not active"
      });
    }

    let generatedOtp = OTP();
    let hashedOtp = await bcrypt.hashSync(generatedOtp, 10);

    let isOtpExists = await otpModel.findOne({
      user: user._id,
      purpose: "FORGOT_PASSWORD"
    })

    if (isOtpExists) {
      isOtpExists.otp = hashedOtp;
      await isOtpExists.save();
    }

    else {
      await otpModel.create({
        user: user._id,
        otp: hashedOtp,
        purpose: "FORGOT_PASSWORD",
        expiresAt: new Date(Date.now() + 5 * 60 * 1000)
      });
    }

    sendForgotPasswordMail(user.email, user.name, generatedOtp);

    return res.status(201).json({
      message: "OTP sent to mail successfully"
    })
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong",
      error: err.message
    })
  }
}

export const forgotPasswordReset = async (req, res) => {
  try {
    let { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(200).json({
        message: "Email, OTP and New Password are required"
      })
    }

    let user = await userModel.findOne({ email: email });

    let savedOtp = await otpModel.findOne({
      user: user._id,
      purpose: "FORGOT_PASSWORD"
    });

    if (!savedOtp) {
      return res.status({
        message: "OTP not found"
      })
    }

    let isOTPValid = await bcrypt.compare(otp, savedOtp.otp);

    if (!isOTPValid) {
      return res.status(400).json({
        message: "Invald OTP"
      })
    }

    if (savedOtp.expiresAt < new Date()) {
      await savedOtp.deleteOne({ user: user._id });
      return res.status(400).json({
        message: "OTP has expired"
      })
    }

    let newHashedPassword = await bcrypt.hashSync(newPassword, 10);

    user.password = newHashedPassword;
    await user.save();

    await savedOtp.deleteOne({ user: user._id });

    res.status(200).json({
      message: "Password reset successfully"
    })

  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong",
      error: err.message
    })
  }
}

export const resendRegistrationOtp = async (req, res) => {
  try {
    let { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    let user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: "Email is already verified"
      });
    }

    let generatedOtp = OTP();
    let hashedOtp = bcrypt.hashSync(generatedOtp, 10);

    let isOtpExists = await otpModel.findOne({
      user: user._id,
      purpose: "REGISTER"
    });

    if (isOtpExists) {
      isOtpExists.otp = hashedOtp;
      isOtpExists.expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      await isOtpExists.save();
    } else {
      await otpModel.create({
        user: user._id,
        otp: hashedOtp,
        purpose: "REGISTER",
        expiresAt: new Date(Date.now() + 5 * 60 * 1000)
      });
    }

    sendRegistrationMail(user.email, generatedOtp);

    return res.status(200).json({
      message: "OTP sent to mail successfully"
    });

  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong",
      error: err.message
    });
  }
};

export const healthCheck = async function (req, res) {
    try {
        return res.status(200).json({
            success: true,
            message: "Server is healthy",
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Health check failed"
        });
    }
};