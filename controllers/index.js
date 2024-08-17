const jwt = require('jsonwebtoken');

const User = require('../models/user.model')
const crypto = require('crypto')
const nodemailer = require("nodemailer");
const JWT_SECRET = 'harshndsjadjakswalia74nds759'
const dotenv = require('dotenv');
dotenv.config()
const axios = require('axios')

function generateToken(walletAddress) {
    return jwt.sign({ walletAddress }, JWT_SECRET, { expiresIn: '1h' });
}



function generateOTP(length = 10) {
    const min = 10 ** (length - 1);
    const max = 10 ** length;
    const otp = crypto.randomInt(min, max).toString();
    return otp.padStart(length, '0');
}



const signUp = async (req, res) => {
    try {

        const { walletAddress } = req?.body
        if (!walletAddress) {
            throw new Error("wallet adress is required")
        }
        const user = await User.findOne({ walletAddress })
        if (user?.walletAddress) return res.status(400).json({ status: "fail", msg: 'User already exists' });

        await User.create({ walletAddress })

        // const token = generateToken(walletAddress);

        res.json({ status: "sucess", msg: "wallet added to db" });
    } catch (error) {
        console.log(error.message);
    }


}


const now = new Date();

// Add 10 minutes (600,000 milliseconds) to the current time
const tenMinutesLater = new Date(now.getTime() + 10 * 60 * 1000);

const tenMinutesLaterString = tenMinutesLater.toLocaleTimeString();
const currentTimeString = now.toLocaleTimeString();
console.log('Current Time:', currentTimeString);
console.log('Time 10 Minutes Later:', tenMinutesLaterString);

const sendEmail = async (req, res) => {
    try {
        const { walletAddress, email } = req.body
        const user = await User.findOne({ walletAddress });
        if (!user) return res.status(400).json({
            status: "fail",
            msg: "Login first using wallet"
        })
        const otp = generateOTP(7);
        console.log(otp);
        const time = Date.now()
        const transporter = nodemailer.createTransport({
            host: "smtp.zoho.in",
            port: 465,
            secure: true, // Use true for port 465, false for all other ports
            auth: {
                user: "harshwalia@zohomail.in",
                pass: process.env.EMAILPASS,
            },
        });


        await transporter.sendMail({
            from: 'harshwalia@zohomail.in',
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP code is ${otp}.It is valid for the next 10 minutes`
        });
        console.log("object");
        Object.assign(user, {
            otp,
            time
        })
        await user.save()
        return res.status(200).json({
            status: "success",
            message: "OTP sent to mail"
        })

    } catch (error) {
        console.error(error)
    }



}

const verifyEmail = async (req, res) => {
    try {
        const { walletAddress, otpEntered, email } = req.body
        const user = await User.findOne({ walletAddress });
        if (!user) {
            return res.status(404).json({
                status: "fail",
                msg: "User doesn't exist"
            });
        }

        const savedTime = new Date(user.time);

        const currentTime = new Date();

        const tenMinutesLater = new Date(savedTime.getTime() + 10 * 60 * 1000);

        // Check if the current time is more than 10 minutes later than savedTime
        if (currentTime > tenMinutesLater) {
            return res.status(400).json({
                status: "fail",
                msg: "The verification link has expired."
            });
        }


        if (otpEntered != user.otp) {
            console.log(otpEntered, user.otp);
            return res.status(400).json({ status: "fail", msg: "Invalid OTP." });
        }
        Object.assign(user, {
            email,
            isVerified: true
        })
        await user.save()
        return res.status(200).json({ status: "success", msg: "Email verified successfully.", email: user.email, verified: user.isVerified });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            msg: "An error occurred during verification.",
            error: error.message
        });
    }
};
const transaction = async (req, res) => {
    const { walletAddress, transactionStatus, transactionDetails } = req?.body
    console.log(walletAddress);

    const user = await User.findOne({ walletAddress });
    if (!user) {
        return res.status(404).json({
            status: "fail",
            msg: "User doesn't exist"
        });
    }
    console.log(user);
    const email = user.email
    if (!email) return {
        status: "fail",
        msg: "email not found"
    }

    const transporter = nodemailer.createTransport({
        host: "smtp.zoho.in",
        port: 465,
        secure: true, // Use true for port 465, false for all other ports
        auth: {
            user: "harshwalia@zohomail.in",
            pass: process.env.EMAILPASS,
        },
    });
    console.log(transporter);
    await transporter.sendMail({
        from: 'harshwalia@zohomail.in',
        to: email,
        subject: 'Your Transaction Status and Details Demo',
        text: `Here is the status and details of your recent transaction:

        Sender Wallet Address: ${transactionDetails.fromPubkey}
        Transaction Status: ${transactionStatus}
        Transaction Amount (lamporta): ${transactionDetails.lamports}

        If you have any questions or need further assistance, please don't hesitate to contact us.`
    });

    res.json({
        status: "success",
        msg: "transaction details sent to mail"
    })

}

const mintNFT = async (req, res) => {
    const { collectionId, metadata, walletAddress } = req.body
    const apiKey = process.env.API_KEY
    // const collectionId = 'd383cf76-23f5-4c1e-a97e-b9f6e9e0b112'; // Replace with your actual collectionId
    // const templateId = 'abacd1e6-8e14-4c9c-9297-cd5e10fb79f9';
    const url = `https://staging.crossmint.com/api/2022-06-09/collections/${collectionId}/nfts`;

    const payload = {
        // metadata: {
        //     name: "harkirat milking",
        //     image: "https://crossmint.myfilebase.com/ipfs/QmZRGrtbWC7CqKvXcDRCiCeoXsf1iLEpxswy3CK4yKcxyW",
        //     description: "Harkirat milking his 4CR package",
        //     attributes: []
        // },
        metadata,
        recipient: walletAddress,
        reuploadLinkedFiles: true,
        compressed: true
    };

    try {
        const response = await axios.post(url, payload, {
            headers: {
                'X-API-KEY': apiKey,
                'Content-Type': 'application/json'
            }
        });
        console.log(response.data);

        res.json({
            status: "success",
            msg: "NFT minted successfully to your wallet",
            data: response.data
        })
    } catch (error) {
        console.error('Error making the request:', error.message);
        res.json({ status: "fail", msg: "minting failed" });
    }

}
const metaData = async (req, res) => {
    const { templateId, collectionId } = req?.body
    const apiKey = process.env.API_KEY
    console.log("templateId", templateId);
    console.log("collectionId", collectionId);
    // const collectionId = 'd383cf76-23f5-4c1e-a97e-b9f6e9e0b112'; // Replace with your actual collectionId
    // const templateId = 'abacd1e6-8e14-4c9c-9297-cd5e10fb79f9'; // Replace with your actual templateId

    try {

        const response = await axios.get(
            `https://staging.crossmint.com/api/2022-06-09/collections/${collectionId}/templates/${templateId}`,
            {
                headers: {
                    'X-API-KEY': apiKey
                }
            }
        );
        console.log(response.data);
        res.json({
            status: "success",
            msg: "templated data fetched successfully",
            data: response.data
        })

    } catch (err) {
        console.error('Error making the request:', err.message);
        res.json({ status: "fail", msg: "failed to get metadata" });
    }
};
const allTemplates = async (req, res) => {
    const { collectionId } = req?.body
    const apiKey = process.env.API_KEY


    console.log("collectionId->", collectionId);
    // const collectionId = 'd383cf76-23f5-4c1e-a97e-b9f6e9e0b112'; // Replace with your actual collectionId
    // const templateId = 'abacd1e6-8e14-4c9c-9297-cd5e10fb79f9'; // Replace with your actual templateId

    try {

        const response = await axios.get(
            `https://staging.crossmint.com/api/2022-06-09/collections/${collectionId}/templates`,
            {
                headers: {
                    'X-API-KEY': apiKey
                }
            }
        );
        console.log(response.data);
        res.json({
            status: "success",
            msg: "All templates data fetched successfully",
            data: response.data
        })

    } catch (err) {
        console.error('Error making the request:', err.message);
        res.json({ status: "fail", msg: "failed to get templates" });
    }
};
const FetchNftByWallet = async (req, res) => {
    const { walletAddress } = req?.body
    const apiKey = process.env.API_KEY


    console.log("walletaddress->", walletAddress);
    // const collectionId = 'd383cf76-23f5-4c1e-a97e-b9f6e9e0b112'; // Replace with your actual collectionId
    // const templateId = 'abacd1e6-8e14-4c9c-9297-cd5e10fb79f9'; // Replace with your actual templateId

    try {

        const response = await axios.get(
            `https://staging.crossmint.com/api/2022-06-09/wallets/solana:${walletAddress}/nfts`,
            {
                headers: {
                    'X-API-KEY': apiKey
                }
            }
        );
        console.log(response.data);
        res.json({
            status: "success",
            msg: "fetched NFTs of wallet successfully ",
            data: response.data
        })

    } catch (err) {
        console.error('Error making the request:', err.message);
        res.json({ status: "fail", msg: "failed to fetch walletaddress NFTS" });
    }
};




const protected = (req, res) => {
    // The user is authenticated if they reached here
    res.json({ message: 'This is a protected route', user: req.user.walletAddress });
};

module.exports = { signUp, protected, sendEmail, verifyEmail, transaction, mintNFT, metaData, allTemplates, FetchNftByWallet }
