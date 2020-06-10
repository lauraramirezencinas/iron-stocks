const { Router } = require('express');
const router = new Router
const mongoose = require('mongoose');
const User = require("../models/User.model")
const bcrypt = require("bcryptjs");
const saltRounds = 10;

router.get('/signup', (req, res) => res.render('auth/signup'));

router.get('/userProfile',(req,res) => res.render('user/user-profile', {user:req.session.currentUser}));

router.post('/signup', (req, res, next) => {
  //console.log(req.body)
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.render('auth/signup', { errorMessage: 'Las informaciones username, email y contraseña son obligatorias' });
    return;
  }

  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!regex.test(password)) {
    res.render('auth/signup', { errorMessage: 'La contraseña tienen q tener 6 ch, 1may y min' });
    return;
  }

  bcrypt.genSalt(saltRounds)
    .then(salt => bcrypt.hash(password, salt))
    .then(hashedPassword => {
      console.log("la hash es:", hashedPassword);
      //crear el usuario en la base de datos 
      User.create({
        username: username,
        email: email,
        passwordHash: hashedPassword
      })
        .then(user => {
          console.log("Usuario creado.Datos:", user);
          req.session.currentUser = user;
          res.render("user/user-profile");
        })
        .catch(error => {
          if (error instanceof mongoose.Error.ValidationError) {
            res.status(400).render('auth/signup', {
              errorMessage: error.message
            });

          } else if (error.code === 11000) {
            //error de duplicidad
            res.status(500).render('auth/signup', { errorMessage: 'username o correo ya existen...' });

          } else {
            next(error);
          }
        })
    })
    .catch(err => next(err))

});

router.get('/login', (req, res) => res.render('auth/login'))

router.post('/login', (req, res, next) => {
  const { email, password } = req.body;
  if (email === '' || password === '') {
    res.render('auth/login', {
      errorMessage: 'Please enter both, email and password to login.'
    });
    return;
  }

  User.findOne({ email })
    .then(user => {
      if (!user) {
        res.render('auth/login', { errorMessage: 'Email is not registered. Try with other email.' });
        return;
      } else if (bcrypt.compareSync(password, user.passwordHash)) {
        req.session.currentUser = user;
        //res.render('users/user-profile', { user });
        res.redirect('/userProfile');
      } else {
        res.render('auth/login', { errorMessage: 'Incorrect password.' });
      }
    })
    .catch(error => next(error));
});

router.post('/logout', (req,res,next)=>{
  req.session.destroy();
  res.redirect('/');
});


module.exports = router;