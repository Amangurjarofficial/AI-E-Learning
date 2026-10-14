// // const loginUser = async (req, res) => {
// //     try {
// //         const { email, password } = req.body;

// //         // Check required fields
// //         if (!email || !password) {
// //             return res.status(400).json({
// //                 message: "Email and password are required"
// //             });
// //         }

// //         // Find user by email
// //         const user = await User.findOne({ email });

// //         if (!user) {
// //             return res.status(401).json({
// //                 message: "Invalid email or password"
// //             });
// //         }

// //         // Compare password with stored hash
// //         const isPasswordValid = await bcrypt.compare(
// //             password,
// //             user.password
// //         );

// //         if (!isPasswordValid) {
// //             return res.status(401).json({
// //                 message: "Invalid email or password"
// //             });
// //         }

// //         // Generate JWT token
// //         const token = jwt.sign(
// //             {
// //                 id: user._id,
// //                 role: user.role
// //             },
// //             process.env.JWT_SECRET,
// //             { expiresIn: "1d" }
// //         );

// //         // Send response
// //         return res.status(200).json({
// //             message: "Login successful",
// //             token,
// //             user: {
// //                 id: user._id,
// //                 name: user.name,
// //                 email: user.email,
// //                 role: user.role
// //             }
// //         });

// //     } catch (error) {
// //         console.error("Login error:", error.message);

// //         return res.status(500).json({
// //             message: "Server error"
// //         });
// //     }
// // };


// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const User = require("../models/User");

// // ================= REGISTER USER =================
// const registerUser = async (req, res) => {
//     try {
//         const { name, email, password } = req.body;

//         // Check required fields
//         if (!name || !email || !password) {
//             return res.status(400).json({
//                 message: "All fields are required"
//             });
//         }

//         // Check if user already exists
//         const normalizedEmail = email.trim().toLowerCase();
//         const existingUser = await User.findOne({
//             email: normalizedEmail
//         });

//         if (existingUser) {
//             return res.status(400).json({
//                 message: "User already exists"
//             });
//         }

//         // Hash password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Create user
//         const user = await User.create({
//             name,
//             email: normalizedEmail,
//             password: hashedPassword
//         });

//         return res.status(201).json({
//             message: "User registered successfully",
//             user: {
//                 id: user._id,
//                 name: user.name,
//                 email: user.email,
//                 role: user.role
//             }
//         });

//     } catch (error) {
//         console.error("Registration error:", error.message);

//         if (error.code === 11000) {
//             return res.status(409).json({
//                 message: "Email is already registered"
//             });
//         }

//         return res.status(500).json({
//             message: "Server error"
//         });
//     }
// };

// // ================= LOGIN USER =================
// const loginUser = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         // Check required fields
//         if (!email || !password) {
//             return res.status(400).json({
//                 message: "Email and password are required"
//             });
//         }

//         // Find user by email
//         const normalizedEmail = email.trim().toLowerCase();
//         const user = await User.findOne({
//             email: normalizedEmail
//         });

//         if (!user) {
//             return res.status(401).json({
//                 message: "Invalid email or password"
//             });
//         }

//         // Compare password with stored hash
//         const isPasswordValid = await bcrypt.compare(
//             password,
//             user.password
//         );

//         if (!isPasswordValid) {
//             return res.status(401).json({
//                 message: "Invalid email or password"
//             });
//         }

//         // Check JWT secret
//         if (!process.env.JWT_SECRET) {
//             console.error("JWT_SECRET is missing from .env");

//             return res.status(500).json({
//                 message: "Server configuration error"
//             });
//         }

//         // Generate JWT token
//         const token = jwt.sign(
//             {
//                 id: user._id.toString(),
//                 role: user.role
//             },
//             process.env.JWT_SECRET,
//             { expiresIn: "1d" }
//         );

//         // Send response
//         return res.status(200).json({
//             message: "Login successful",
//             token,
//             user: {
//                 id: user._id,
//                 name: user.name,
//                 email: user.email,
//                 role: user.role
//             }
//         });

//     } catch (error) {
//         console.error("Login error:", error.message);

//         return res.status(500).json({
//             message: "Server error"
//         });
//     }
// };

// // ================= EXPORT BOTH FUNCTIONS =================
// module.exports = {
//     registerUser,
//     loginUser
// };



const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

// ================= REGISTER USER =================
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        // Validate role; default to student
        const selectedRole = role || "student";

        if (!["student", "instructor"].includes(selectedRole)) {
            return res.status(400).json({
                message: "Role must be student or instructor"
            });
        }

        // Normalize email
        const normalizedEmail = email.trim().toLowerCase();

        // Check if user already exists
        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email is already registered"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: selectedRole
        });

        return res.status(201).json({
            message: "Registration successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Registration error:", error.message);

        if (error.code === 11000) {
            return res.status(409).json({
                message: "Email is already registered"
            });
        }

        return res.status(500).json({
            message: "Server error"
        });
    }
};

// ================= LOGIN USER =================
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check required fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // Find user by email
        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Compare password with stored hash
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Check JWT secret
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is missing from .env");

            return res.status(500).json({
                message: "Server configuration error"
            });
        }

        // Generate JWT token with user ID and role
        const token = jwt.sign(
            {
                id: user._id.toString(),
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // Send response
        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error.message);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

// ================= EXPORT FUNCTIONS =================
module.exports = {
    registerUser,
    loginUser
};
