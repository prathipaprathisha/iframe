const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cors = require("cors");
const db = require("./knexfile");  



const app  = express();
const port = 8000;
app.use(cors());
app.use(bodyParser.json());




const executeQuery = (query) => {
    console.log('Executing query:', query.toString());
    return query;
};
app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send("Username and password are required");
    }

    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = db('user_admin').insert({ username,password:hashedPassword,org_password:password });
        executeQuery(query); 
        await query;

        res.send("User registered successfully");
    } catch (err) {
        console.error("Error executing query:", err);
        res.status(500).send("Internal server error");
    }
});
async function checkUser(password, haspassword) {
    //... fetch user from a db etc.

    const match = await bcrypt.compare(password,haspassword);

    if(match) {
       return true;
    }
    return false;
    //...
}
app.post("/login", async (req, res) => {
    const { username,password } = req.body;
    
    if (!username || !password) {
        return res.status(400).send("Username and password are required");
    }

    try {
        const query = db('user_admin').where({ username: username }).select('*');
        console.log('Executing query:', query.toString());  
        const users = await query;

        if (users.length === 0) {
            return res.status(401).send("Invalid username or password");
        }

        const user = users[0];
       
        const isMatch = checkUser(password, user.password);
        console.log('password:', password);  
        console.log('user.password:', user.password);  
        console.log('Password match result:', isMatch);  
        if (!isMatch) {
            return res.status(401).send("Invalid username or password");
        }

        res.send("Login successful");
    } catch (err) {
        console.error("Error executing query:", err);
        res.status(500).send("Internal server error");
    }
});

app.listen(port, err => {
    if (err) {
        console.error("Error starting server:", err);
    } else {
        console.log(`Server is running on port ${port}`);
    }
});