const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../schemas/user.schema");
const { check, validationResult } = require("express-validator");
const auth = require("../auth/auth.MiddleWare");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Yüklenen resimlerin saklanacağı hedef klasörü belirtin
  },
  filename: function (req, file, cb) {
    //front-end tarafında avatar olarak gönderilen dosya adını alın
    const avatarName = req.body.avatar;
    // Yüklenen resim dosyasının orijinal adını alın
    const originalName = file.originalname;

    const extension = path.extname(file.originalname);
    cb(null, originalName, extension); // Yüklenen resim dosyası için dosya adını belirtin
  },
});

const upload = multer({ storage: storage });

// Kullanıcı kaydı rotası
router.post(
  "/signup",
  upload.single("avatar"),
  [
    check("name", "Name is required").notEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
    check("location", "Location is required").notEmpty(),
    check("phone", "Phone is required").notEmpty(),
  ],
  async (req, res) => {
    // Doğrulama hatalarını kontrol et
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, location, phone } = req.body;

    try {
      // Kullanıcının zaten var olup olmadığını kontrol et
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ msg: "User already exists" });
      }

      // Yeni bir kullanıcı oluştur
      user = new User({ name, email, password, location, phone });
      console.log(req.file);
      if (req.file) {
        const avatarUrl = req.file.path; // Yüklenen resim dosyasının yolunu al
        user.avatarUrl = avatarUrl; // Kullanıcı nesnesinde avatarUrl alanını ayarla
      }

      // Şifreyi hashle
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      // Kullanıcıyı veritabanına kaydet
      await user.save();

      // JWT token oluştur
      const payload = {
        user: {
          id: user.id,
        },
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      res.json({ token });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// User login route
router.post(
  "/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Check if the user exists
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ msg: "Invalid Credentials" });
      }

      // Check if the password is correct
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Invalid Credentials" });
      }

      // Create a JWT token
      const payload = {
        user: {
          id: user.id,
        },
      };
      console.log(payload);
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      res.json({ token });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// Get user profile
router.get(":id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.get("/me", auth, async (req, res) => {
  try {
    // Find the user in the database using the id stored in the JWT token
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
// Update user's profile
router.put("/updateProfile", auth, async (req, res) => {
  const { bio, name, location, birthday } = req.body;
  console.log(req.body);
  try {
    // Find the user in the database using the id stored in the JWT token
    let user = await User.findById(req.user.id);
    console.log(user);
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }
    // Update user properties
    if (name) user.name = name;
    if (location) user.location = location;
    if (bio) user.bio = bio;
    if (birthday) user.birthday = birthday;

    // Save the updated user to the database
    try {
      await user.save();
      res.json(user);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
// Update user's email, phone, and password
router.put("/update", auth, async (req, res) => {
  const { email, password, phone } = req.body;

  try {
    // Find the user in the database using the id stored in the JWT token
    let user = await User.findById(req.user.id);
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }
    // Update user properties
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    // Save the updated user to the database
    await user.save();

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
// Delete user
router.delete("/delete", auth, async (req, res) => {
  try {
    // Find the user in the database using the id stored in the JWT token
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Delete the user from the database
    await user.deleteOne();

    res.json({ msg: "User deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
//update avatar
router.put("/updateAvatar", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    if (req.file) {
      console.log(req.file);
      const newAvatarUrl = req.file.path; // Yüklenen resim dosyasının yolunu al
      console.log(newAvatarUrl);
      user.avatarUrl = newAvatarUrl; // Kullanıcı nesnesinde avatarUrl alanını güncelle
      await user.save(); // Kullanıcı nesnesini veritabanına kaydet
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
