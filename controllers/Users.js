import Users from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const getUsers = async (req, res) => {
	try {
		const User = await Users.findAll({
			attributes: ["id", "name", "email"],
		});
		res.json(User);
	} catch (error) {
		console.log(error);
	}
};

export const Register = async (req, res) => {
	const { name, email, password, confPassword } = req.body;
	if (password !== confPassword)
		return res.status(400).json({ msg: "Password Harus Sama" });
	const salt = await bcrypt.genSalt();
	const hashPassword = await bcrypt.hash(password, salt);
	try {
		await Users.create({
			name: name,
			email: email,
			password: hashPassword,
		});
		res.json({ msg: "Registration Successful" });
	} catch (error) {
		console.log(error);
	}
};

export const login = async (req, res) => {
	try {
		const user = await Users.findAll({
			where: {
				email: req.body.email,
			},
		});
		const match = await bcrypt.compare(req.body.password, user[0].password);
		if (!match) return res.status(400).json({ msg: "Wrong Email Or Password" });
		const userId = user[0].id;
		const name = user[0].name;
		const email = user[0].email;
		// res.json(process.env.ACCESS_TOKEN_SECRET);
		const accessToken = jwt.sign(
			{ userId, name, email },
			process.env.ACCESS_TOKEN_SECRET,
			{
				expiresIn: "20s",
			}
		);
		const refreshTokens = jwt.sign(
			{ userId, name, email },
			process.env.REFRESH_TOKEN_SECRET,
			{
				expiresIn: "1d",
			}
		);
		await Users.update(
			{ refreshToken: refreshTokens },
			{
				where: {
					id: userId,
				},
			}
		);
		res.cookie("refreshToken", refreshTokens, {
			httpOnly: true,
			maxAge: 24 * 60 * 60 * 1000,
		});
		res.json({ accessToken });
	} catch (error) {
		res.status(404).json({ msg: "Email Or Password Wrong" });
	}
};

export const logout = async (req, res) => {
	const refreshToken = req.cookies.refreshToken;
	if (!refreshToken) return res.sendStatus(204);
	const user = await Users.findAll({
		where: {
			refreshToken: refreshToken,
		},
	});
	if (!user[0]) return res.sendStatus(204);
	const userId = user[0].id;
	await Users.update(
		{ refreshToken: null },
		{
			where: {
				id: userId,
			},
		}
	);
	res.clearCookie("refreshToken");
	return res.sendStatus(200);
};
