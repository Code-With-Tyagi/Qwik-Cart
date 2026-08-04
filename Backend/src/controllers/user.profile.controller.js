import userModel from "../models/user.model.js";
import otpModel from "../models/otp.model.js";
import OTP from "../services/otp.service.js";
import { sendAccountReactivationMail, sendEmailUpdateOtpMail, sendMobileUpdateMail } from "../services/email.service.js";
import bcrypt from "bcryptjs";
import orderModel from "../models/order.model.js";
import contactModel from "../models/contact.model.js";
import reviewModel from "../models/reviews.model.js";
import cartModel from "../models/Cart.model.js";

export const updatePersonalInformation = async (req, res) => {
  try {
    const { fullName, gender } = req.body;

    const userId = req.user._id; // From authentication middleware

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      {
        name: fullName,
        gender,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "Personal information updated successfully",
      user: updatedUser,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const requestEmailUpdate = async (req, res) => {
  try {
    let { newEmail } = req.body;

    if (!newEmail) {
      return res.status(400).json({
        message: "New email is required."
      });
    }

    let isEmailExists = await userModel.findOne({
      email: newEmail
    })

    if (isEmailExists) {
      return res.status(409).json({
        message: "This email is already taken."
      })
    }

    if (newEmail === req.user.userEmail) {
      return res.status(400).json({
        message: "New email cannot be the same as your current email."
      });
    }

    let generatedOTP = OTP();
    let hashedOTP = bcrypt.hashSync(generatedOTP, 10);

    let isOtpExists = await otpModel.findOne({
      user: req.user._id,
      purpose: "EMAIL_UPDATE"
    })

    if (isOtpExists) {
      isOtpExists.otp = hashedOTP;
      await isOtpExists.save();
    }

    else {
      await otpModel.create({
        user: req.user._id,
        otp: hashedOTP,
        purpose: "EMAIL_UPDATE",
        email: newEmail,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000)
      })
    }

    await sendEmailUpdateOtpMail(newEmail, req.user.userEmail, generatedOTP);

    return res.status(201).json({
      message: "OTP sent to mail successfully"
    })
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong",
      error: err.message,
    })
  }
};

export const verifyEmailUpdate = async (req, res) => {
  try {
    let { otp } = req.body;

    const savedOtp = await otpModel.findOne({
      user: req.user._id,
      purpose: "EMAIL_UPDATE"
    });

    if (savedOtp.expiresAt < new Date()) {
      await otpModel.findByIdAndDelete(savedOtp._id);

      return res.status(400).json({
        message: "OTP has expired.",
      });
    }

    if (!savedOtp) {
      return res.status(404).json({
        message: "OTP not found"
      })
    }

    let isOtpValid = await bcrypt.compare(otp, savedOtp.otp);

    if (!isOtpValid) {
      return res.status(400).json({
        message: "Invalid OTP"
      })
    }

    let userEmail = savedOtp.email;

    let updatedUser = await userModel.findByIdAndUpdate(savedOtp.user, {
      email: userEmail
    })

    await otpModel.findByIdAndDelete(savedOtp._id);


    return res.status(200).json({
      message: "Email updated successfully.",
      user: updatedUser
    });

  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong",
      error: err.message
    })
  }
};

export const requestMobileUpdate = async function (req, res) {
  try {
    const { mobileNumber } = req.body;

    if (!mobileNumber) {
      return res.status(400).json({
        message: "Mobile number is required."
      });
    }

    let isMobileNumberExists = await userModel.findOne({ mobileNumber: mobileNumber });

    if (isMobileNumberExists) {
      return res.status(409).json({
        message: "This mobile number is already taken."
      })
    }

    if (mobileNumber === req.user.mobileNumber) {
      return res.status(400).json({
        message: "New mobile number cannot be the same as your current mobile number."
      });
    }

    let generatedOTP = OTP();
    let hashedOTP = await bcrypt.hashSync(generatedOTP, 10);

    let isOtpExists = await otpModel.findOne({
      user: req.user._id,
      purpose: "MOBILE_UPDATE"
    })

    if (isOtpExists) {
      isOtpExists.otp = hashedOTP;
      await isOtpExists.save();
    }

    else {
      await otpModel.create({
        user: req.user._id,
        otp: hashedOTP,
        purpose: "MOBILE_UPDATE",
        mobileNumber: mobileNumber,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000)
      })
    }

    await sendMobileUpdateMail(req.user.userEmail, req.user.userName, generatedOTP);

    await otpModel.findByIdAndDelete(req.user._id);

    return res.status(201).json({
      message: "OTP sent to mail"
    })

  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong",
      error: err.message
    })
  }
}

export const verifyMobileUpdate = async function (req, res) {

  try {
    let { otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        message: "OTP is required"
      })
    }

    let savedOTP = await otpModel.findOne({
      user: req.user._id,
      purpose: "MOBILE_UPDATE"
    });

    if (!savedOTP) {
      return res.status(404).json({
        message: "OTP not found"
      })
    }

    if (savedOTP.expiresAt < new Date()) {
      await savedOTP.deleteOne({ user: req.user._id });
      return res.status(400).json({
        message: "OTP has expired"
      })
    }

    let isOtpValid = await bcrypt.compare(otp, savedOTP.otp);

    if (!isOtpValid) {
      return res.status(400).json({
        message: "Invalid OTP."
      });
    }

    let updatedUser = await userModel.findByIdAndUpdate(req.user._id, {
      mobileNumber: savedOTP.mobileNumber
    });

    return res.status(200).json({
      message: "Mobile Number updated successfully",
      user: updatedUser
    });
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong",
      error: err.message
    })
  }

}

export const deactivateAccountRequest = async function (req, res) {
  try {
    let { password } = req.body;

    if (!password) {
      return res.status(400).json({
        message: "Password is required to deactivate the account"
      })
    }

    let user = await userModel.findOne({ _id: req.user._id });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      })
    }

    if (user.accountStatus === "DEACTIVE") {
      return res.status(400).json({
        message: "Your account is already deactivated."
      });
    }

    let isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Invalid password."
      });
    }

    let updatedUser = await userModel.findByIdAndUpdate(req.user._id, {
      accountStatus: "DEACTIVE"
    })

    res.clearCookie("token");

    return res.status(200).json({
      message: "Account deactivated successfully."
    });

  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong",
      error: err.message
    })
  }
}

export const deleteAccountRequest = async function (req, res) {
  try {
    let { password } = req.body;

    if (!password) {
      return res.status(400).json({
        message: "Password is required to delete the account"
      })
    }

    let user = await userModel.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      })
    }

    let isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Invalid Password"
      })
    }

    await cartModel.deleteOne({ user: req.user._id });
    await userModel.deleteOne({ _id: req.user._id });

    res.clearCookie("token");

    return res.status(200).json({
      message: "Account deleted successfully"
    })
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong",
      error: err.message
    })
  }

}

export const changePasswordRequest = async function (req, res) {
  try {
    let { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "All fields are mandatory"
      })
    }

    let loggedInUser = await userModel.findById(req.user._id);

    if (!loggedInUser) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    let isCurrentPasswordValid = await bcrypt.compare(currentPassword, loggedInUser.password);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        message: "Current Password is incorrect"
      })
    }

    const isPasswordMatched = newPassword === confirmPassword;

    if (!isPasswordMatched) {
      return res.status(400).json({
        message: "New password and confirm password do not match."
      })
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: "New password cannot be the same as your current password."
      });
    }

    let hashedPassword = bcrypt.hashSync(newPassword, 10);
    loggedInUser.password = hashedPassword;
    await loggedInUser.save();

    return res.status(200).json({
      message: "Password updated successfully."
    });
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong",
      error: err.message
    })
  }
}

export const accountReactivationRequest = async function (req, res) {
  try {
    let { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required for reactivation of account"
      })
    }

    let user = await userModel.findOne({ email: email });

    if (!user) {
      return res.status(404).json({
        message: "This account cannot be reactivated. Please register again."
      })
    }

    if (user.accountStatus === "ACTIVE") {
      return res.status(400).json({
        message: "Account is already active"
      })
    }

    let generatedOtp = OTP();
    let hashedOtp = await bcrypt.hashSync(generatedOtp, 10);
    console.log(generatedOtp);

    let isOtpExists = await otpModel.findOne({
      user: user._id,
      purpose: "ACCOUNT_REACTIVATION"
    })

    if (isOtpExists) {
      isOtpExists.otp = hashedOtp;
      await isOtpExists.save();
    }

    else {
      await otpModel.create({
        user: user._id,
        otp: hashedOtp,
        purpose: "ACCOUNT_REACTIVATION",
        expiresAt: new Date(Date.now() + 5 * 60 * 1000)
      })
    }

    sendAccountReactivationMail(user.email, user.name, generatedOtp);

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

export const accountReactivationVerify = async function (req, res) {
  try {
    let { otp, email } = req.body;

    if (!otp || !email) {
      return res.status(400).json({
        message: "Email and OTP are required"
      });
    }

    let user = await userModel.findOne({ email: email });

    let otpDetails = await otpModel.findOne({
      user: user._id,
      purpose: "ACCOUNT_REACTIVATION"
    });

    if (!otpDetails) {
      return res.status(404).json({
        message: "OTP not found"
      })
    }

    let isOtpValid = await bcrypt.compare(otp, otpDetails.otp);

    if (!isOtpValid) {
      return res.status(400).json({
        message: "Invalid OTP"
      })
    }

    if (otpDetails.expiresAt < new Date()) {
      await otpDetails.deleteOne({ user: user._id });
      return res.status(400).json({
        message: "OTP has expired"
      })
    }

    user.accountStatus = "ACTIVE";
    await user.save();

    await otpDetails.deleteOne({ user: user._id });

    return res.status(200).json({
      message: "Account reactivated successfully"
    })

  } catch (err) {
    res.status(500).json({
      message: "Something went wrong",
      error: err.message
    })
  }
}