import { PassportStatic } from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { User } from './model/user';
import { INCORRECT_EMAIL_OR_PASSWORD_ERR, USER_NOT_FOUND_ERR } from "./consts/msgs";


export const configurePassport = (passport: PassportStatic): PassportStatic => {
    passport.serializeUser((user: any, done) => {
        return done(null, user._id);
    });

    passport.deserializeUser(async (id: string, done) => {
        User.findById(id)
        .then(user => {
            if(!user) {
                return done(new Error(USER_NOT_FOUND_ERR));
            }
            return done(null, user);
        })
        .catch(error => {
            return done(error);
        })
    });

    passport.use(
        'local',
        new LocalStrategy(
            { usernameField: 'email', passwordField: 'password' },
            async (email, password, done) => {
                User.findOne({ email: email })
                    .then(user => {
                        if (!user) {
                            return done(null, false, { message: INCORRECT_EMAIL_OR_PASSWORD_ERR });
                        }
                        user.comparePassword(password, (error, isMatch) => {
                            if (error) {
                                return done(null, false, { message: INCORRECT_EMAIL_OR_PASSWORD_ERR });
                            }

                            return done(null, user._id);
                        })
                    })
                    .catch(error => {
                        return done(error);
                    });
            }
        )
    );

    return passport;
};