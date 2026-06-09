require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/User");
const app = express();
app.use(express.json());
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("✅ MongoDB Connected");
})
.catch((err) => {
    console.log(err);
});

app.get("/", (req, res) => {
    res.send("Chat App Server Running");
});
app.post("/register", async (req, res) => {

    try {

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: hashedPassword
});

        await newUser.save();

        res.status(201).json({
            message: "User Registered Successfully"
        });

    } 
    catch (error) {

    console.log("ERROR:", error);

    res.status(500).json({
        message: error.message
    });

}
});
app.post("/login", async (req, res) => {

    try {

        const user = await User.findOne({
            email: req.body.email
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(
            req.body.password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid Password"
            });
        }

       const token = jwt.sign(
    {
        id: user._id,
        email: user.email
    },
    process.env.JWT_SECRET,
    {
        expiresIn: "1d"
    }
);

res.status(200).json({
    message: "Login Successful",
    token
});

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: error.message
        });

    }

});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});