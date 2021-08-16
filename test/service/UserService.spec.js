const dotenv = require('dotenv');
dotenv.config();

const chai = require('chai');
const { expect } = chai;

const { UserAuthDTO } = require('../../data/dto');

const UserDTO = require('../data/dto/UserDTO');
const LoginInfoDTO = require('../data/dto/LoginInfoDTO');
const TokenGroupDTO = require('../data/dto/TokenGroupDTO');

const userService = require('../../service/UserService');
const {
    WrongPasswordError,
    PasswordPolicyError,
} = require('../../utils/errors/errors');
userService.setJwt(require('../lib/token.mock.js'));
userService.setCrypto(require('../lib/crypto.mock.js'));
userService.setUserDao(require('../dao/UserDao.mock.js'));

describe('# User Service Test', () => {
    describe('# createUser Test', () => {
        it('# success Test', (done) => {
            userService
                .createUser({})
                .then((result) => {
                    expect(result).to.be.instanceOf(TokenGroupDTO);
                    result.validTest();
                    done();
                })
                .catch((err) => done(err));
        });
    });

    describe('# authUser Test', () => {
        it('# success Test', (done) => {
            userService
                .authUser('token')
                .then((result) => {
                    expect(result).to.be.instanceOf(UserAuthDTO);
                    expect(result.isAuth).to.be.true;
                    expect(result.isAdmin).to.be.true;
                    done();
                })
                .catch((err) => done(err));
        });
        it('# With No Auth', (done) => {
            userService.setJwt({
                verify: () => {
                    throw 'error';
                },
            });
            userService
                .authUser('token')
                .then((result) => {
                    expect(result).to.be.instanceOf(UserAuthDTO);
                    expect(result.isAuth).to.be.false;
                    expect(result.isAdmin).to.be.false;
                    done();
                })
                .catch((err) => done(err));
        });
        after(() => {
            userService.setJwt(require('../lib/token.mock.js'));
        });
    });

    describe('# loginUser Test', () => {
        it('# wrong password', (done) => {
            userService
                .loginUser('', 'password')
                .then((it) => {
                    done(new UnExpectedError(WrongPasswordError));
                })
                .catch((err) => {
                    expect(err).to.be.instanceOf(WrongPasswordError);
                    done();
                })
                .catch((err) => done(err));
        });
        it('# success case', (done) => {
            userService
                .loginUser('', 'decrypted')
                .then((result) => {
                    expect(result).to.be.instanceOf(LoginInfoDTO);
                    result.validTest();
                    done();
                })
                .catch((err) => done(err));
        });
    });

    describe('# updateUser Test', () => {
        it('# success Test', (done) => {
            userService
                .updateUser({ userIdx: 1 })
                .then((it) => {
                    expect(it).to.be.instanceOf(UserDTO);
                    it.validTest();
                    done();
                })
                .catch((err) => done(err));
        });
    });

    describe('# changePassword Test', () => {
        it('# wrong prev password', (done) => {
            userService
                .changePassword({
                    userIdx: 1,
                    prevPassword: 'wrong',
                    newPassword: '',
                })
                .then(() => {
                    done(new UnExpectedError(WrongPasswordError));
                })
                .catch((err) => {
                    expect(err).to.be.instanceOf(WrongPasswordError);
                    done();
                })
                .catch((err) => done(err));
        });

        it('# same password(restrict by password policy)', (done) => {
            userService
                .changePassword({
                    userIdx: 1,
                    prevPassword: 'decrypted',
                    newPassword: 'decrypted',
                })
                .then(() => {
                    done(new UnExpectedError(PasswordPolicyError));
                })
                .catch((err) => {
                    expect(err).to.be.instanceOf(PasswordPolicyError);
                    done();
                })
                .catch((err) => done(err));
        });
    });
});
