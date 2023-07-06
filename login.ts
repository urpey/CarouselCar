import express, { Request, Response } from 'express';
import { checkPassword, hashPassword } from './hash';
import "./session";
import { client } from './db';
import "./googlegrant"
import { grantMiddleware } from './googlegrant';
import fetch from 'node-fetch';

export let loginRoute = express.Router()

loginRoute.get("/user", async (req: Request, res: Response) => {
    // GET logged in User in Any page
    //check any user logged in, if no, show login box
    res.json(req.session["user"] ? req.session["user"] : { id: undefined });

})

loginRoute.post("/login", async (req: Request, res: Response) => {
    const username = req.body.username
    const password = req.body.password

    //1. Login Success
    //2. Wrong User Name
    //3. Wrong Password
    const users = await client.query(`SELECT * FROM users WHERE username=$1`,[username])
    if (users.rows.length == 0) {
        res.json({
            success: false,
            msg: ('用戶不存在')
        })
        return;
    }
    const user = users.rows[0]
    const validation = await checkPassword(password, user.password)
    if (!validation) {
        res.json({
            success: false,
            msg: ('密碼錯誤')
        })
        return;
    }

    req.session["user"] = { id: user.id, username: user.username }
    //AJAX, RESTful, 
    //method+action -> JSON/String String/multipart data<-JSON
    res.json({
        success: true,
        msg: 'Success',
        username: username,
    })
    // res.redirect("/login.html")  
    //res.json({username,password})

    //SUBMIT form from html directly without AJAX validation
    //RES.REDIRECT("/")
})

loginRoute.post('/signup', async (req, res) => {
    let { username, password, displayname, phone } = req.body
    const hash_password = await hashPassword(password);

    if (!username) {
        res.json({ success: false, msg: '未有輸入郵箱' })
        return;
    }
    if (!password) {
        res.json({ success: false, msg: '未有輸入密碼' })
        return;
    }
    client.query(/* sql */ `insert into users (username, password, displayname, phone) 
    values ($1, $2, $3, $4) returning id`, [username, hash_password, displayname, phone])

        .then(result => {
            let id = result.rows[0].id
            req.session.user = {
                id,
                username,
            }
            res.json({ success: true, msg: "註冊成功！" })
        })
        .catch(error => {
            if (String(error).includes('unique')) {
                res.json({ success: false, msg: '該用戶名稱已被註冊' })
            }
        })
})

loginRoute.get("/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
        res.redirect("/")
    })
})

loginRoute.get("/login/google", async(req: Request,res: Response) => {
    let access_token = req.session?.grant?.response?.access_token
    if (!access_token) {
      res.status(400).json({ error: 'missing access_token in grant session' })
      return
    }
    type GoogleProfile = {
        email: string
        picture: string
      }
    let profile: any
  try {
    let googleRes = await fetch(
      `https://www.googleapis.com/oauth2/v2/userinfo`,
      {
        headers: { Authorization: 'Bearer ' + access_token },
      },
    )
    profile = await googleRes.json()
  } catch (error) {
    res.status(502).json({ error: 'Failed to get user info from Google' })
    return
  }

  try {
    // try to lookup existing users
    let result = await client.query(
      /* sql */ `
select id from users
where username = $1
`,
      [profile.email],
    )
    let user = result.rows[0]

    // auto register if this is a new user
    if (!user) {
      result = await client.query(
        /* sql */ `
insert into users
(username,password,displayname) values ($1,$2,$3)
returning id
`,
        [profile.email,await hashPassword("123456"),profile.email]

      )
      user = result.rows[0]
    }

    let id = user.id
    req.session.user = {
      id,
      username: profile.email,
    }
    // res.json({ id })
    res.redirect('/')
  } catch (error) {
    res.status(500).json({ error: 'Database Error: ' + String(error) })
  }
})
