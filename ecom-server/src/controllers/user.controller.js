import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { User } from "../models/user-model.js";
import { signupSchema } from "../schemas/signupSchema.js";
import bcrypt from 'bcrypt';
import {z} from 'zod';
import { usernameValidation } from "../schemas/signupSchema.js";
import { verifySchema } from "../schemas/verifySchema.js";
import { generateAccessAndRefreshTken } from "../utils/authUtils.js";
import { sendVerificationEmail } from "../helpers/sendVerificationEmail.js";
import NodeCache from 'node-cache';
import request from 'request';
import requestPromise from 'request-promise-native';
const myCache = new NodeCache();
import { updateSchema } from "../schemas/updateSchema.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
      user: "junaidk8185@gmail.com",
      pass: "pdruxjhjdtwqsywk",
    },
  });

const UsernameSchema = z.object({
    username: usernameValidation,
});


const signup = asyncHandler( async(req, res) => {
    let {username, email, password} = req.body;

    const validation = signupSchema.safeParse(req.body);

    if(!validation.success) {
        const usernameErrors = validation.error.format().username?._errors || [];
        const emailErrors = validation.error.format().email?._errors || [];
        const passwordErrors = validation.error.format().password?._errors || [];

        return res
        .status(400)
        .json(
            new ApiResponse(
                400,
                {
                    "usernameError": `${usernameErrors?.length > 0 ? `${usernameErrors[0]}` : ""}`,
                    "emailError": `${emailErrors?.length > 0 ? `${emailErrors[0]}` : ""}`,
                    "passwordError": `${passwordErrors?.length > 0 ? `${passwordErrors[0]}` : ""}`,
                },
            )
        )
    }

        
        if(
            [username, email, password].some( (field) => field?.trim === "" )
        ) {
    
            return res
            .status(400)
            .json(
                new ApiResponse(
                    400,
                    {
                        "usernameError": `${username?.trim === "" ? "Username is required" : ""}`,
                        "emailError": `${email?.trim === "" ? "Email is required" : ""}`,
                        "passwordError": `${password?.trim === "" ? "Password is required" : ""}`,
                    },
                )
            )
        }

    
    username = username.toLowerCase();
    const existingVerifiedUserByUsername = await User.findOne({
        username,
        isVerified: true
    })

    if(existingVerifiedUserByUsername) {
        return res
        .status(400)
        .json(
            new ApiResponse(400, {"usernameError": "username is taken"}, "Signup failed")
        )
    }

    const existingUserByEmail = await User.findOne({email});

    const verifyCode = Math.floor(100000 + (Math.random()*900000)).toString();

    if(existingUserByEmail) {
        if(existingUserByEmail.isVerified) {
            return res
            .status(400)
            .json(
                new ApiResponse(400, {"emailError": "email is taken"}, "Signup failed")
            )
        } 

        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1);

        existingUserByEmail.username = username;
        existingUserByEmail.password = password;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = expiryDate;
        existingUserByEmail.isVerified = true;
   
        await existingUserByEmail.save();
    } else {
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1);

        const existingNotVerifiedUserByUsername = await User.findOne({
            username,
            isVerified: false
        })
    
        if(existingNotVerifiedUserByUsername) {
            existingNotVerifiedUserByUsername.email = email;
            existingNotVerifiedUserByUsername.password = password;
            existingNotVerifiedUserByUsername.verifyCode = verifyCode;
            existingNotVerifiedUserByUsername.verifyCodeExpiry = expiryDate;
            existingNotVerifiedUserByUsername.isVerified = true;

            await existingNotVerifiedUserByUsername.save();
        } else {
            await User.create({
                username,
                email,
                password,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: true,
            })
        }
    }

    const user = await User.find({email})

    return res
    .status(200)
    .json(new ApiResponse(200, user, "User registered successfully, Please verify your account"));
} )

const sendVerificationCode = asyncHandler(async(req, res) => {
    const {username} = req.body;

    if(!username) {
        throw new ApiError(404, "Email or username not received");
    }

    const user = User.find({username});

    if(!user) {
        throw new ApiError(404, "User not found");
    }
    const verifyCode = Math.floor(100000 + (Math.random()*900000)).toString();

    const verificationEmailResponse = await sendVerificationEmail(
        email= user[0].email,
        username,
        verifyCode
    )

    if(!verificationEmailResponse) {
        return res
        .status(500)
        .json(
            new ApiResponse(500, verificationEmailResponse.response)
        )
    }

    return res
    .status(200)
    .json(new ApiResponse(200, "Verification code sent successfully"));
})

function storeStringWithExpiration(key, value, expirationSeconds) {
    const expirationTime = expirationSeconds * 1000;
    myCache.set(key, value, expirationTime);
  
    setTimeout(() => {
      myCache.del(key);
    //   console.log(`Key '${key}' expired and was removed from the cache.`);
    }, expirationTime);
  }

  function getStringFromCache(key) {
    console.log(myCache.get(key));
    return myCache.get(key);
  }

const getAuthToken = async () => {
    const key = "authToken"
    const expirationSeconds = 7 * 24 * 60 * 60
    let authToken = `eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJDLTNFMEFDQjZEQUU4RDRCMSIsImlhdCI6MTcyMTgyODE4NywiZXhwIjoxODc5NTA4MTg3fQ.jiqsT9Z6LSu2WR2fbYYbiCNzxsfdsrqYbGUk-gFz422cCKZ4MZA2iExqmGa6Qbp98ZR_hLM9r7OPoDKL-s1U1w`;
    if (authToken === undefined || authToken === null) {
      const options = {
        method: 'GET',
        uri: `https://api-prod.messagecentral.com/auth/v1/authentication/token?country=IN&customerId=C-3E0ACB6DAE8D4B1&key=U2twQDEyMzQ=&scope=NEW`,
        headers: {
          accept: '*/*'
        }
      };
  
      try {
        const response = await requestPromise(options);
        const token = JSON.parse(response)["token"];
        storeStringWithExpiration(key, token, expirationSeconds);
        authToken = token;
        // console.log(myCache.get(key));
      } catch (error) {
        throw new Error("Error", error);
      }
  
      return authToken;
    } else {
    //   console.log(authToken);
      return authToken;
    }
  };

const sendSuccessSMS = asyncHandler(async(req, res) => {
    const { phoneNumber, fullName, email, productName, quantity, date, time } = req.body;

    const users = await User.find({});
    let admin;
    users.forEach((user) => {
      if(user.isAdmin) {
        admin = user;
      }
    })

    const mailOptions = {
      from: "junaidk8185@gmail.com",
      to: email,
      subject: "Thank You for Your Order! – Order Confirmation from SKP Decor",
      html: `
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                color: #333; /* Dark grey text color */
                line-height: 1.6;
                padding: 20px;
                background-color: #f9f9f9; /* Light grey background */
                margin: 0;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #fff; /* White background for content area */
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
              h1 {
                color: #ff9800; /* Orange heading color */
                border-bottom: 2px solid #ddd; /* Light grey border */
                padding-bottom: 10px;
                margin-bottom: 20px;
              }
              p {
                margin: 10px 0;
                font-size: 16px;
              }
              .label {
                font-weight: bold;
                color: #ff9800; /* Orange color for labels */
              }
              .footer {
                margin-top: 20px;
                font-size: 14px;
                color: #555; /* Dark grey for footer text */
              }
              .link {
                color: #1e90ff;
                text-decoration: none;
              }
              .link:hover {
                text-decoration: underline;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Order Confirmation</h1>
              <p>Dear ${fullName},</p>
              <p>Thank you so much for your recent order with SKP Decor!</p>
              <p>We are excited to let you know that we have received your order. Here are the details of your purchase:</p>
              <p><span class="label">Product Name:</span> ${productName}</p>
              <p><span class="label">Quantity:</span> ${quantity}</p>
              <p><span class="label">Date of Order:</span> ${date}</p>
              <p><span class="label">Time of Order:</span> ${time}</p>
              <p>Your satisfaction is our top priority. If you have any questions or need further assistance, please feel free to reach out to us. Our customer support team is always here to help!</p>
              <p>Call us on - 8360175563</p>
              <p>Once again, thank you for choosing SKP Decor. We truly appreciate your business and look forward to serving you again!</p>
              <p class="footer">Warm regards,<br>The SKP Decor Team</p>
            </div>
          </body>
        </html>
      `,
  };
  
    
    

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res
        .status(500)
        .send({ success: false, message: "Failed to send email", error });
    }
    res
      .status(200)
      .send({ success: true, message: "Order details send to admin at email!!" });
  });

    // const message = `Hello ${encodeURIComponent(fullName)}! Your SKP Decor order for ${productName} is confirmed and being processed. Date of Order - ${date}, Time of order - ${time}. We’re excited to get your items to you! Stay tuned for shipping updates`;

    // var options = {
    //   'method': 'POST',
    //   'url': `https://cpaas.messagecentral.com/verification/v3/send?countryCode=91&customerId=C-3E0ACB6DAE8D4B1&senderId=SKP Decor&type=SMS&flowType=SMS&mobileNumber=${phoneNumber}&message=${message}`,
    //   'headers': {
    //   'authToken': `eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJDLUZCMzg2MDM2MzgyNTRFOSIsImlhdCI6MTcyMjI0NDY4MSwiZXhwIjoxODc5OTI0NjgxfQ.MjfMgBNzHHZfklc18LAwOlUV28k_atPb7jLHMJ8ungAssIb1KJTFWOh1RIBsHF40S443e0Wrd9Jx5pfTv7-Vrg`
    //   }
    //   };
    //   request(options, function (error, response) {
    //   if (error) throw new Error(error);
    //   console.log(response.body);
    //   return res
    //   .status(200)
    //   .json(new ApiResponse(200, response.body, "Done"))
    //   });
})

// const testing = asyncHandler(async (req, res) => {
//   const { phoneNumber, fullName, productName, date, time } = req.body;

//   // URL-encode the parameters to prevent unescaped characters
//   const encodedFullName = encodeURIComponent(fullName);
//   const encodedProductName = encodeURIComponent(productName);
//   const encodedDate = encodeURIComponent(date);
//   const encodedTime = encodeURIComponent(time);
//   const encodedPhoneNumber = encodeURIComponent(phoneNumber);

//   const message = `Hello ${encodedFullName}! Your SKP Decor order for ${encodedProductName} is confirmed and being processed. Date of Order - ${encodedDate}, Time of order - ${encodedTime}. We’re excited to get your items to you! Stay tuned for shipping updates`;

//   // Ensure the whole URL is properly encoded
//   const url = `https://cpaas.messagecentral.com/verification/v3/send?countryCode=91&customerId=C-3E0ACB6DAE8D4B1&senderId=UTOMOB&type=SMS&flowType=SMS&mobileNumber=${encodedPhoneNumber}&message=${encodeURIComponent(message)}`;

//   const options = {
//     method: 'POST',
//     url: url,
//     headers: {
//       'authToken': `eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJDLUZCMzg2MDM2MzgyNTRFOSIsImlhdCI6MTcyMjI0NDY4MSwiZXhwIjoxODc5OTI0NjgxfQ.MjfMgBNzHHZfklc18LAwOlUV28k_atPb7jLHMJ8ungAssIb1KJTFWOh1RIBsHF40S443e0Wrd9Jx5pfTv7-Vrg`
//     }
//   };

//   request(options, function (error, response) {
//     if (error) {
//       console.error('Request error:', error);
//       return res.status(500).json(new ApiResponse(500, null, "Internal Server Error"));
//     }
//     console.log('Response body:', response.body);
//     return res
//       .status(200)
//       .json(new ApiResponse(200, response.body, "Done"));
//   });
// });

// const testing = asyncHandler(async(req, res) => {

//   const { phoneNumber, fullName, productName, date, time } = req.body;

//   // URL-encode the parameters to prevent unescaped characters
//   // const encodedFullName = encodeURIComponent(fullName);
//   // const encodedProductName = encodeURIComponent(productName);
//   // const encodedDate = encodeURIComponent(date);
//   // const encodedTime = encodeURIComponent(time);
//   // const encodedPhoneNumber = encodeURIComponent(phoneNumber);

//   var options = {
//   'method': 'POST',
//   'url': `https://cpaas.messagecentral.com/verification/v3/send?countryCode=91&customerId=C-FB38603638254E9&senderId=UTOMOB&type=SMS&flowType=SMS&mobileNumber=${phoneNumber}&message=Welcome to Message Central. We are are delighted to have you here! - Powered by U2opia`,
//   'headers': {
//   'authToken': `eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJDLUZCMzg2MDM2MzgyNTRFOSIsImlhdCI6MTcyMjI0NDY4MSwiZXhwIjoxODc5OTI0NjgxfQ.MjfMgBNzHHZfklc18LAwOlUV28k_atPb7jLHMJ8ungAssIb1KJTFWOh1RIBsHF40S443e0Wrd9Jx5pfTv7-Vrg`
//   }
//   };
//   request(options, function (error, response) {
//   if (error) throw new Error(error);
//   console.log(response.body);
//   });
// })

const sendEmailToAdmin = asyncHandler(async(req, res ) => {
    const { fullName, phoneNumber, productName, quantity, date, time } = req.body;
      
    const users = await User.find({});
    let admin;
    users.forEach((user) => {
      if(user.isAdmin) {
        admin = user;
      }
    })
  
    const mailOptions = {
        from: "junaidk8185@gmail.com",
        to: `junaidk8185@gmail.com`,
        subject: "New Order Received",
        html: `
          <html>
            <head>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  color: #000; /* Black text color */
                  line-height: 1.6;
                  padding: 20px;
                  background-color: #ff9800; /* Orange background */
                  margin: 0;
                }
                .container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                  background-color: #fff; /* White background for content area */
                  border-radius: 8px;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
                }
                h1 {
                  color: #000; /* Black heading color */
                  border-bottom: 2px solid #ddd; /* Light grey border */
                  padding-bottom: 10px;
                  margin-bottom: 20px;
                }
                p {
                  margin: 10px 0;
                  font-size: 16px;
                }
                .label {
                  font-weight: bold;
                  color: #ff9800; /* Orange color for labels */
                }
                .footer {
                  margin-top: 20px;
                  font-size: 14px;
                  color: #555; /* Dark grey for footer text */
                }
                .link {
                  color: #1e90ff;
                  text-decoration: none;
                }
                .link:hover {
                  text-decoration: underline;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>New Order Received</h1>
                <p>We are pleased to inform you that a new order has been received. Below are the details of the order:</p>
                <p><span class="label">Customer Name:</span> ${fullName}</p>
                <p><span class="label">Customer Phone Number:</span> ${phoneNumber}</p>
                <p><span class="label">Product Name:</span> ${productName}</p>
                <p><span class="label">Quantity:</span> ${quantity}</p>
                <p><span class="label">Date of Order:</span> ${date}</p>
                <p><span class="label">Time of Order:</span> ${time}</p>
                <p>Please review the order details and proceed with the necessary actions:</p>
                <p><a href="https://admin.skpdecor.co.in" class="link">Go to Admin Panel</a></p>
              </div>
            </body>
          </html>
        `,
      };
      
      
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res
          .status(500)
          .send({ success: false, message: "Failed to send email", error });
      }
      res
        .status(200)
        .send({ success: true, message: "Order details send to admin at email!!" });
    });
})

const sendVerificationCodeThroughSMS = asyncHandler(async(req, res) => {
    const {phoneNumber} = req.body;
    const authToken = await getAuthToken();

    const options = {
        method: 'POST',
        url: `https://api-prod.messagecentral.com/verification/v2/verification/send?countryCode=91&customerId=C-3E0ACB6DAE8D4B1&flowType=SMS&mobileNumber=${phoneNumber}`,
        headers: {
          'authToken': authToken
        }
      };
    
    //   console.log(options);
    
      request(options, (error, response, body) => {
        if (error) {
          res.status(404).send({ "message": "Unable to send Otp" });
          throw new Error(error);
        }
    
        try {
          const parsedBody = JSON.parse(body);
          res.status(200).send({ "data": parsedBody });
        } catch (parseError) {
          res.status(500).send({ "message": "Failed to parse response body" });
          console.error('Failed to parse response body:', parseError);
          console.error('Response body:', body);
        }
      });
})

const verifySMSOtp = async (req, res) => {
    const verificationId = req.body["verificationId"];
    const phoneNumber = req.body["phoneNumber"];
    const otp = req.body["otp"];
    const authToken = await getAuthToken();
    const options = {
      method: 'GET',
      url: `https://api-prod.messagecentral.com/verification/v2/verification/validateOtp?countryCode=91&mobileNumber=${phoneNumber}&verificationId=${verificationId}&customerId=C-3E0ACB6DAE8D4B1&code=${otp}`,
      headers: {
        'authToken': authToken
      }
    };
    // console.log(options);
    request(options, async (error, response, body) => {
      if (error) {
        res.status(404).send({ "message": "Otp verification failed" });
        throw new Error(error);
      }
      try {
        const parsedBody = JSON.parse(body);
        console.log(parsedBody);
        res.status(200).send({ "data": parsedBody });
      } catch (parseError) {
        res.status(500).send({ "message": "Failed to parse response body" });
        console.error('Failed to parse response body:', parseError);
        console.error('Response body:', body);
      }
    });
  };

const verifyCode = asyncHandler(async(req, res) => {
        let { code, username } = req.body;

        const usernameValidationResult = UsernameSchema.safeParse({ username });
        const codeValidationResult = verifySchema.safeParse({ code });

        if (!usernameValidationResult.success) {
            const usernameErrors = usernameValidationResult.error.format().username?._errors[0] || [];
            throw new ApiError(400, {message: usernameErrors?.length > 0 ? usernameErrors.join(', ') : "Invalid username"})
        }

        if (!codeValidationResult.success) {
            // console.log(codeValidationResult.error.format().code);
            const codeErrors = codeValidationResult.error.format().code?._errors || [];
            throw new ApiError(400, {message: codeErrors?.length > 0 ? codeErrors.join(', ') : "Invalid code"})
        }

        const validUsername = usernameValidationResult.data.username;
        const validCode = codeValidationResult.data.code;

        const user = await User.findOne({ username: validUsername });

        if (!user) {
            throw new ApiError(404, "User not found")
        }

        const isCodeValid = (user.verifyCode === validCode);
        const expiryDate = new Date(user.verifyCodeExpiry);
        if (isNaN(expiryDate)) {
            throw new ApiError(404, "Something went wrong")
        }
        const isCodeNotExpired = (new Date(expiryDate) >= new Date());

        if (isCodeValid && isCodeNotExpired) {
            const {accessToken, refreshToken} = await generateAccessAndRefreshTken({userId: user._id});

            const options = {
                httpOnly: true,
                secure: true,
                expires: new Date(Date.now() + 25892000000),
                sameSite: 'None',
            }

            user.isVerified = true;
            await user.save();

            const updatedUser = await User.findById({_id: user._id}).select("-password -verifycode -verifyCodeExpiry -refreshToken");

    
            return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        updatedUser, refreshToken, accessToken
                    },
                    "User account verified successfully"
                )
            )
        }

        if(!isCodeValid) {
            return res.json(
               new ApiResponse(400, {message: "Verfication code is incorrect. Please enter correct code"})
            )
        }

        if(!isCodeNotExpired) {
            return res.json(
                new ApiResponse(400, {message: "Your verification code is expired. Please signup again to get a new code"})
            )
        }
})

const curUser = asyncHandler(async(req, res) => {
    const user = req.user;
    return res
    .status(200)
    .json(new ApiResponse(200, user, "User fetched"))
})

const signin = asyncHandler(async(req, res) => {
    let{email, password} = req.body;

    if(!email) {
        return res
            .status(400)
            .json(
                new ApiResponse(
                    400,
                    {
                        "emailError": `Email or username is required`,
                    },
                )
            )
    }

    if(!password) {
        return res
            .status(400)
            .json(
                new ApiResponse(
                    400,
                    {
                        "emailError": `Passowrd is required`,
                    },
                )
            )
    }

    let user = await User.findOne(
        {"email": email}
    );

    if(!user) {
        user = await User.findOne(
            {"username": email}
        );
    }

    if(!user) {
        return res
        .status(400)
        .json(
            new ApiResponse(
                400,
                {
                    "emailError": "User not found",
                },
            )
        )
    }

    
    if(!user.isVerified) {
        return res
        .status(400)
        .json(
            new ApiResponse(
                400,
                {
                    "emailError": "Account is not verified",
                },
            )
        )
    }
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if(!isPasswordValid) {
        if(process.env.SECURITY_PASSKEY.toString() !== password.toString()) {
            return res
            .status(400)
            .json(
                new ApiResponse(
                    400,
                    {
                        "emailError": "Credentials are wrong"
                    },
                )
            )
        }
        
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTken({userId: user._id})

    const loggedInUser = await User.findById(user._id)
    .select("-password -refreshToken -verifyCode -verifyCodeExpiry");

    const options = {
        httpOnly: true,
        secure: true,
        expires: new Date(Date.now() + 25892000000),
        sameSite: 'None',
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, refreshToken, accessToken
            },
            "User logged in successfully"
        )
    )
})

const refreshAccessToken = asyncHandler( async(req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken._id)
    
        if(!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if(user?.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "Refresh Token is Expired or used")
        }
    
        const{accessToken, newRefreshToken} = await generateAccessAndRefreshTken(user._id)
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse( 
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Refresh token is refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error.message || "Invalid refresh token")
    }

} )

const logout = asyncHandler( async(req, res) => {
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken:1 
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(
            200, user, "User logout succesfully"
        )
    )
} )

const isUserLoggedIn = asyncHandler( async(req, res) => {
    const token = req.cookies.accessToken
    let isAuthenticated = false;
    if(token) {
        isAuthenticated = true;
    }
    let isAdmin = false;
    if(isAuthenticated) {
        let user = req.user;
        isAdmin = user.isAdmin;
    }

    return res
    .status(200)
    .json(new ApiResponse(200, {"isAuthenticated": isAuthenticated, "isAdmin": isAdmin}, "Data fetched successfully"));
} )  

const updateUserDetails = asyncHandler( async(req, res) => {
    let {username, email, password, key} = req.body;

    const validation = updateSchema.safeParse(req.body);

    if(!validation.success) {
        const usernameErrors = validation.error.format().username?._errors || [];
        const emailErrors = validation.error.format().email?._errors || [];
        const passwordErrors = validation.error.format().password?._errors || [];

        return res
        .status(400)
        .json(
            new ApiResponse(
                400,
                {
                    "usernameError": `${usernameErrors?.length > 0 ? `${usernameErrors[0]}` : ""}`,
                    "emailError": `${emailErrors?.length > 0 ? `${emailErrors[0]}` : ""}`,
                    "passwordError": `${passwordErrors?.length > 0 ? `${passwordErrors[0]}` : ""}`,
                },
            )
        )
    }

        
        if(
            [username, email, password].some( (field) => field?.trim === "" )
        ) {
    
            return res
            .status(400)
            .json(
                new ApiResponse(
                    400,
                    {
                        "usernameError": `${username?.trim === "" ? "Username is required" : ""}`,
                        "emailError": `${email?.trim === "" ? "Email is required" : ""}`,
                        "passwordError": `${password?.trim === "" ? "Password is required" : ""}`,
                    },
                )
            )
        }
    let user=req.user;

    await User.findByIdAndUpdate(user._id, {
        username,
        email,
    })

    if(password.toString() !== 'DUMMYPASSWORD') {
        if(process.env.SECURITY_PASSKEY.toString() !== key.toString()) {
            return res
            .status(400)
            .json(
                new ApiResponse(
                    400,
                    {
                        "passwordError": "Credentials are wrong",
                    },
                )
            )
        }
        user = await User.findById(user._id)
        user.password = password;
        await user.save()
    }

    user = await User.find({email})

    return res
    .status(200)
    .json(new ApiResponse(200, user, "User updated successfully"));
} )

export {signup, sendVerificationCode, updateUserDetails, sendSuccessSMS, sendEmailToAdmin, verifyCode, curUser, sendVerificationCodeThroughSMS, verifySMSOtp, signin, refreshAccessToken, logout, isUserLoggedIn};