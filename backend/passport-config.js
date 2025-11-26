import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";

function initialize(passport, getUserByEmail, getUserById) {
  const authenticateUser = async (email, password, done) => {
    const user = await getUserByEmail(email);
    if (!user || !user.user_ID) {
      return done(null, false, {
        message:
          "Correo electrónico o contraseña incorrecta. Por favor, vuelve a intentarlo nuevamente.",
      });
    }

    try {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) return done(null, user);
      else
        return done(null, false, {
          message:
            "Correo electrónico o contraseña incorrecta. Por favor, vuelve a intentarlo nuevamente.",
        });
    } catch (e) {
      return done(e);
    }
  };

  passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser));
  passport.serializeUser((user, done) => {
    if (!user || !user.user_ID)
      return done(new Error("Usuario inválido para serializar"));
    done(null, user.user_ID);
  });

  passport.deserializeUser(async (user_ID, done) => {
    try {
      const user = await getUserById(user_ID);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}

export default initialize;
