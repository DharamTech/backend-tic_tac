import dotenv from "dotenv";
//config
dotenv.config();
import express from "express";
import cors from "cors";
import { StreamChat } from "stream-chat";
import { v4 as uuidv4, validate } from "uuid";
import bcrypt from "bcrypt";

const port = process.env.PORT || '5000'

const app = express();

app.use(cors());

app.use(express.json());

const api_key = "zcah9vyvc8mr";
const api_secret =
  "5psxnwwencvcm2eyd3377bcgdwm3u6hzffz7n2u7f2jq2netwx2rgdtawbyyfy5x";
const serverClient = StreamChat.getInstance(api_key, api_secret);

app.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, username, password } = req.body;
    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);
    const token = serverClient.createToken(userId);
    res.json({ token, userId, firstName, lastName, username, hashedPassword });
  } catch (error) {
    res.json(error);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const { users } = await serverClient.queryUsers({ name: username });
    if (users.length === 0) return res.json({ message: "User not found" });

    const token = serverClient.createToken(users[0].id);
    const passwordMatch = await bcrypt.compare(
      password,
      users[0].hashedPassword
    );

    if (passwordMatch) {
      res.json({
        token,
        firstName: users[0].firstName,
        lastName: users[0].lastName,
        username,
        userId: users[0].id,
      });
    }
  } catch (error) {
    res.json(error);
  }
});

app.listen(port, () => {
  console.log(`Server is running : ${port}`);
});



