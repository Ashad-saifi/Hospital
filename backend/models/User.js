const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    id: { 
        type: String, 
        required: true, 
        unique: true 
    },
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    phone: { 
        type: String, 
        default: "" 
    },
    age: { 
        type: Number, 
        default: 0 
    },
    gender: { 
        type: String, 
        default: "Male" 
    },
    bloodGroup: { 
        type: String, 
        default: "O+" 
    },
    role: { 
        type: String, 
        default: "patient" 
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("User", UserSchema);
