import type { Request, Response } from 'express';
const User = require("../models/User")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const registerUser = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        const checkExistingUser = await User.findOne({
            $or: [{ username }],
        });
        if (checkExistingUser) {
            return res.status(400).json({
                status: "fail",
                message: "Username already exists. Please choose another one."
            });
        }
        //hash user password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({
            success: true,
            message: "User registered successfully"
        });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

const loginUser = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid username or password"
            });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid username or password"
            });
        }

        //create user token
        const accessToken = jwt.sign(
            {
                userId: user._id,
                username: user.username,
            },
            process.env.JWT_SECRET_KEY,
            {
                expiresIn: "1h",
            }
        );

        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            accessToken
        });


    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

const changePassword = async (req: Request, res: Response) => {
    try {
        const { username, oldPassword, newPassword } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Old password is incorrect"
            });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });
    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}


module.exports = {
    registerUser,
    loginUser,
    changePassword
};
