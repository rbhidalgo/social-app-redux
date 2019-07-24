const express = require("express");
const request = require("request");
const config = require("config");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");

const Profile = require("../../models/Profile");
const User = require("../../models/User");

// GET route api/profile/user
// Get current users profile
// Private Acess needs auth
router.get("/user", auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id }).populate(
			"user",
			["name", "avatar"]
		);
		if (!profile) {
			return res.status(400).json({ msg: "There is no profile for this user" });
		}
		res.json(profile);
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
});

// POST route api/profile
// POST create or update a user profile
// Private Acess needs auth

router.post(
	"/",
	[
		auth,
		[
			check("status", "Status is required")
				.not()
				.isEmpty(),
			check("skills", "Skills is required")
				.not()
				.isEmpty()
		]
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		const {
			company,
			website,
			location,
			bio,
			status,
			githubusername,
			skills,
			youtube,
			facebook,
			twitter,
			instagram,
			linkedin
		} = req.body;

		// Build Profile Object to inert into the database
		const profileFields = {};
		profileFields.user = req.user.id;
		if (company) profileFields.company = company;
		if (website) profileFields.website = website;
		if (location) profileFields.location = location;
		if (bio) profileFields.bio = bio;
		if (status) profileFields.status = status;
		if (githubusername) profileFields.githubusername = githubusername;
		if (skills) {
			profileFields.skills = skills.split(",").map(skill => skill.trim());
		}

		// Build social object
		profileFields.social = {};
		if (youtube) profileFields.social.youtube = youtube;
		if (twitter) profileFields.social.twitter = twitter;
		if (facebook) profileFields.social.facebook = facebook;
		if (linkedin) profileFields.social.linkedin = linkedin;
		if (instagram) profileFields.social.instagram = instagram;

		try {
			let profile = await Profile.findOne({ user: req.user.id });

			if (profile) {
				//update profile
				profile = await Profile.findOneAndUpdate(
					{ user: req.user.id },
					{ $set: profileFields },
					{ new: true }
				);
				return res.json(profile);
			}

			// Create a new profile
			profile = new Profile(profileFields);

			await profile.save();
			res.json(profile);
		} catch (err) {
			console.log(err.message);
			res.status(500).send("Server Error");
		}
	}
);

// GET route api/profile
// GET Get all profiles
// Public access

router.get("/", async (req, res) => {
	try {
		const profiles = await Profile.find().populate("user", ["name", "avatar"]);
		res.json(profiles);
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
});

// GET route api/profile/user/:user_id
// GET Get profile by user id
// Public access

router.get("/user/:user_id", async (req, res) => {
	try {
		const profile = await Profile.findOne({
			user: req.params.user_id
		}).populate("user", ["name", "avatar"]);
		if (!profile) return res.status(400).json({ msg: "profile not found" });
		res.json(profile);
	} catch (err) {
		console.error(err.message);
		if (err.kind == "ObjectId") {
			return res.status(400).json({ msg: "profile not found" });
		}
		res.status(500).send("Server Error");
	}
});

// DELETE route api/profile
// DELETE delete profile, user & posts
// Private
router.delete("/", auth, async (req, res) => {
	try {
		// Remove Profile
		await Profile.findOneAndRemove({ user: req.user.id });
		// Remove User
		await User.findOneAndRemove({ _id: req.user.id });
		res.json({ msg: "user removed" });
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
});

// PUT route api/profile/experience
// PUT add profile experience
// Private
router.put(
	"/experience",
	[
		auth,
		[
			check("title", "Title is required")
				.not()
				.isEmpty(),
			check("company", "Company is required")
				.not()
				.isEmpty(),
			check("from", "From date is required")
				.not()
				.isEmpty()
		]
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const {
			title,
			company,
			location,
			from,
			to,
			current,
			description
		} = req.body;

		const newExp = {
			title,
			company,
			location,
			from,
			to,
			current,
			description
		};
		try {
			const profile = await Profile.findOne({ user: req.user.id });

			profile.experience.unshift(newExp);

			await profile.save();

			res.json(profile);
		} catch (err) {
			console.error(err.message);
			res.status(500).send("Server Error");
		}
	}
);

// DELETE route api/profile/experience/:exp_id
// DELETE delete experience from profile
// Private
router.delete("/experience/:exp_id", auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id });
		// Get remove index
		const removeIndex = profile.experience
			.map(item => item.id)
			.indexOf(req.params.exp_id);
		profile.experience.splice(removeIndex, 1);
		await profile.save();
		res.json(profile);
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
});

// PUT route api/profile/education
// PUT add profile education
// Private
router.put(
	"/education",
	[
		auth,
		[
			check("school", "School is required")
				.not()
				.isEmpty(),
			check("degree", "Degree is required")
				.not()
				.isEmpty(),
			check("fieldofstudy", "Field of Study is required")
				.not()
				.isEmpty(),
			check("from", "From date is required")
				.not()
				.isEmpty()
		]
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const {
			school,
			degree,
			fieldofstudy,
			from,
			to,
			current,
			description
		} = req.body;

		const newEdu = {
			school,
			degree,
			fieldofstudy,
			from,
			to,
			current,
			description
		};
		try {
			const profile = await Profile.findOne({ user: req.user.id });

			profile.education.unshift(newEdu);

			await profile.save();

			res.json(profile);
		} catch (err) {
			console.error(err.message);
			res.status(500).send("Server Error");
		}
	}
);

// DELETE route api/profile/education/:edu_id
// DELETE delete education from profile
// Private
router.delete("/education/:edu_id", auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id });
		// Get remove index
		const removeIndex = profile.education
			.map(item => item.id)
			.indexOf(req.params.edu_id);
		profile.education.splice(removeIndex, 1);
		await profile.save();
		res.json(profile);
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
});

// GET route api/profile/github/:username
// GET user repos from Github
// Public
router.get("/github/:username", async (req, res) => {
	try {
		const options = {
			uri: `https://api.github.com/users/${
				req.params.username
			}/repos?per_page=5&sort=created:asc&client_id=${config.get(
				"githubClientId"
			)}&client_secret=${config.get("githubSecret")}`,
			method: "GET",
			headers: { "user-agent": "node.js" }
		};
		request(options, (error, response, body) => {
			if (error) console.error(error);
			if (response.statusCode !== 200) {
				return res.status(404).json({ msg: "No Github profile found" });
			}
			res.json(JSON.parse(body));
		});
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server Error");
	}
});

module.exports = router;
