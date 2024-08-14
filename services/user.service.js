// Gettign the Newly created Mongoose Model we just created 
var User = require('../models/User.model');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
// Saving the context of this module inside the _the variable
_this = this

// Async function to get the User List
exports.getUsers = async function (query, page, limit) {

    // Options setup for the mongoose paginate
    var options = {
        page,
        limit,
    }
    // Try Catch the awaited promise to handle the error 
    try {
        var Users = await User.paginate(query, options)
        // Return the Userd list that was retured by the mongoose promise
        return Users;

    } catch (e) {
        // return a Error message describing the reason 
        console.log("error services", e)
        throw Error('Error while Paginating Users');
    }
}


exports.createUser = async function (user) {
    // Check if the email is already in use
    const existingUserByEmail = await User.findOne({ email: user.email });
    if (existingUserByEmail) {
        return {
            description: "Email en uso"
        };
    }

    // Verify that the password meets the required criteria
    const password = user.password;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d.*_\-^]{6,}$/;
    if (!passwordRegex.test(password)) {
        return {
            description: "Password must have at least one uppercase letter, one number, and be at least 6 characters long"
        };
    }

    var hashedPassword = bcrypt.hashSync(password, 8);

    var newUser = new User({
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        company: user.company,
        phone: user.phone,
        rol: user.rol,
        password: hashedPassword,
        validated: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
    });

    try {
        // Saving the User 
        var savedUser = await newUser.save();
        var token = jwt.sign({
            id: savedUser._id
        }, process.env.SECRET, {
            expiresIn: 86400
        });
        return token;
    } catch (e) {
        // return an Error message describing the reason 
        console.log(e);
        throw Error("Error while Creating User");
    }
};


exports.updateUser = async function (user) {

    let _id = { _id: user._id }
    try {
        //Find the old User Object by the Id
        let savedUser = await User.findOneAndUpdate(_id, user, { new: true });
        return savedUser
    } catch (e) {
        throw Error("Error occured while Finding the User")
    }
}


exports.updateUserPassword = async function (user) {

    var email = { email: user.email }
    try {
        //Find the old User Object by the Id
        var oldUser = await User.findOne(email);
    } catch (e) {
        throw Error("Error occured while Finding the User")
    }
    // If no old User Object exists return false
    if (!oldUser) {
        return false;
    }

    var hashedPassword = bcrypt.hashSync(user.password, 8);
    oldUser.password = hashedPassword


    try {
        var savedUser = await oldUser.save()
        return savedUser;
    } catch (e) {
        throw Error("And Error occured while updating the User");
    }
}

exports.deleteUser = async function (mail) {

    // Delete the User
    try {
        var deleted = await User.deleteOne({
            email: mail
        })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("User Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the User")
    }
}


exports.loginUser = async function (user) {

    // Creating a new Mongoose Object by using the new keyword
    try {
        // Find the User 
        var _details = await User.findOne({
            email: user.email
        }).select('+password').populate('company');

        var passwordIsValid = bcrypt.compareSync(user.password, _details.password);
        if (!passwordIsValid) return 0;

        const { password, ...responseUser } = _details._doc
        var token = jwt.sign({
            id: _details._id
        }, process.env.SECRET, {
            expiresIn: 86400 // expires in 24 hours
        });
        return { token: token, user: responseUser };
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Login User")
    }

}

exports.updateWhitelist = async function (content) {
    try {
        var userId = content._id;

        var user = await User.findById(userId);
        if (!user) {
            throw Error("User not found");
        }

        // Replace the user's whitelist with the new one
        user.whitelist = content.whitelist;

        // Save the updated user
        await user.save();

        return { whitelist: user.whitelist };
    } catch (e) {
        // Return an error message describing the reason     
        throw Error("Error while updating whitelist");
    }
}

exports.addOneToWhitelist = async function (content) {
    try {
        var userId = content._id;

        var user = await User.findById(userId);
        if (!user) {
            throw Error("User not found");
        }

        user.whitelist.push(content.content);

        // Save the updated user
        await user.save();

        return { whitelist: user.whitelist };
    } catch (e) {
        console.log(e)
        // Return an error message describing the reason     
        throw Error("Error while updating whitelist");
    }
}


exports.removeFromWhitelist = async function (content) {
    try {
        var userId = content._id;

        var user = await User.findById(userId);

        if (user && user.whitelist.length == 0) {
            return { error: "Whitelist is empty" };
        }

        var contentToRemove = new Set(content.content);
        var newWhitelist = user.whitelist.filter(element => !contentToRemove.has(element));

        var updatedWhitelist = await User.findOneAndUpdate(
            { _id: userId },
            { whitelist: newWhitelist },
            { new: true }
        );

        return { whitelist: updatedWhitelist.whitelist };
    } catch (e) {
        // return an Error message describing the reason     
        throw Error("Error while updating whitelist");
    }
}