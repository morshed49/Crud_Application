const express = require("express");
const router = express.Router();
const user = require("../models/users");
const multer = require("multer");
const fs = require("fs");

// Image upload
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

var upload = multer({
  storage: storage,
}).single("image");

// Get all users Route

router.get("/", async (req, res) => {
  try {
    const users = await user.find().exec();
    res.render("index", {
      title: "Home Page",
      users: users,
    });
  } catch (err) {
    res.json({ message: err.message });
  }
});

router.get("/add", (req, res) => {
  res.render("add_users", { title: "Add User" });
});

// insert an user into database route

router.post("/add", upload, async (req, res) => {
  const newUser = new user({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    image: req.file.filename,
  });

  try {
    await newUser.save();
    req.session.message = {
      type: "success",
      message: "User added successfully!",
    };
    res.redirect("/");
  } catch (err) {
    res.json({ message: err.message, type: "danger" });
  }
});

// Edit an user route
router.get("/edit/:id", (req, res) => {
  let id = req.params.id;
  user
    .findById(id)
    .then((user) => {
      if (!user) {
        res.redirect("/");
      } else {
        res.render("edit_user", {
          title: "Edit User",
          user: user,
        });
      }
    })
    .catch((err) => {
      res.redirect("/");
    });
});

// Update user route
router.post("/update/:id", upload, (req, res) => {
  let id = req.params.id;
  let new_image = "";
  if (req.file) {
    new_image = req.file.filename;
    try {
      fs.unlinkSync("./uploads/" + req.body.old_image);
    } catch (err) {
      console.log(err);
    }
  } else {
    new_image = req.body.old_image;
  }
  user.findByIdAndUpdate(id, {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    image: new_image,
  })
    .then(() => {
      req.session.message = {
        type: "success",
        message: "User Updated Successfully",
      };
      res.redirect("/");
    })
    .catch((err) => {
      res.json({
        message: err.message,
        type: "danger",
      });
    });
});

// delete user with image from folder route

router.get("/delete/:id", (req, res) => {
  let id = req.params.id;
  user
    .findByIdAndRemove(id)
    .then((result) => {
      if (result.image !== "") {
        const imagePath = "./uploads/" + result.image;
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.log(err);
          }
        });
      }
      req.session.message = {
        type: "success",
        message: "User Deleted Successfully",
      };
      res.redirect("/");
    })
    .catch((err) => {
      res.redirect("/");
    });
});

// delete user without image from folder route

// router.get("/delete/:id", (req, res) => {
//   let id = req.params.id;
//   users
//     .findByIdAndRemove(id)
//     .then(() => {
//       req.session.message = {
//         type: "success",
//         message: "User Deleted Successfully",
//       };
//       res.redirect("/");
//     })
//     .catch((err) => {
//       res.redirect("/");
//     });
// });

module.exports = router;
