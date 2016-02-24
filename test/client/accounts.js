/**
 * augur.js unit tests
 * @author Jack Peterson (jack@tinybike.net)
 */

"use strict";

var crypto = require("crypto");
var assert = require("chai").assert;
var chalk = require("chalk");
var keys = require("keythereum");
var EthTx = require("ethereumjs-tx");
var EthUtil = require("ethereumjs-util");
var abi = require("augur-abi");
var utils = require("../../src/utilities");
var constants = require("../../src/constants");
var augur = utils.setup(require("../../src"), process.argv.slice(2));

// generate random private key
var privateKey = crypto.randomBytes(32);
var address = keys.privateKeyToAddress(privateKey);

// generate random handles and passwords
var handle = utils.sha256(new Date().toString());
var password = utils.sha256(Math.random().toString(36).substring(4));
var handle2 = utils.sha256(new Date().toString()).slice(10) + "@" +
    utils.sha256(new Date().toString()).slice(10) + ".com";
var password2 = utils.sha256(Math.random().toString(36).substring(4)).slice(10);
var handle3 = utils.sha256(Math.random().toString(36).substring(4)).slice(0, 7);
var password3 = utils.sha256(Math.random().toString(36).substring(4)).slice(0, 7);

var markets = augur.getMarketsInBranch(augur.branches.dev);
var market_id = markets[markets.length - 1];

function checkAccount(augur, account) {
    assert.notProperty(account, "error");
    assert.isTrue(Buffer.isBuffer(account.privateKey));
    assert.isString(account.address);
    assert.isObject(account.keystore);
    assert.strictEqual(
        account.privateKey.toString("hex").length,
        constants.KEYSIZE*2
    );
    assert.strictEqual(account.address.length, 42);
    assert.isTrue(Buffer.isBuffer(augur.web.account.privateKey));
    assert.isString(augur.web.account.address);
    assert.isObject(augur.web.account.keystore);
    assert.strictEqual(
        augur.web.account.privateKey.toString("hex").length,
        constants.KEYSIZE*2
    );
    assert.strictEqual(augur.web.account.address.length, 42);
    assert.strictEqual(
        account.privateKey.toString("hex"),
        augur.web.account.privateKey.toString("hex")
    );
    assert.strictEqual(account.address, augur.web.account.address);
    assert.strictEqual(
        JSON.stringify(account.keystore),
        JSON.stringify(augur.web.account.keystore)
    );
    assert.strictEqual(account.address.length, 42);
}

describe("Register", function () {

    it("register account 1: " + handle + " / " + password, function (done) {
        this.timeout(constants.TIMEOUT);
        var augur = utils.setup(require("../../src"), process.argv.slice(2));
        augur.db.get(handle, function (record) {
            assert.strictEqual(record.error, 99);
            augur.web.register(handle, password, {doNotFund: true}, function (result) {
                checkAccount(augur, result);
                augur.db.get(handle, function (rec) {
                    assert.notProperty(rec, "error");
                    assert(rec.ciphertext);
                    assert(rec.iv);
                    assert(rec.kdfparams.salt);
                    assert.strictEqual(
                        new Buffer(rec.iv, "base64")
                            .toString("hex")
                            .length,
                        constants.IVSIZE*2
                    );
                    assert.strictEqual(
                        new Buffer(rec.kdfparams.salt, "base64")
                            .toString("hex")
                            .length,
                        constants.KEYSIZE*2
                    );
                    assert.strictEqual(
                        new Buffer(rec.ciphertext, "base64")
                            .toString("hex")
                            .length,
                        constants.KEYSIZE*2
                    );
                    augur.web.logout();
                    done();
                });
            });
        });
    });

    it("register account 2: " + handle2 + " / " + password2, function (done) {
        this.timeout(constants.TIMEOUT);
        var augur = utils.setup(require("../../src"), process.argv.slice(2));
        augur.db.get(handle2, function (record) {
            assert.strictEqual(record.error, 99);
            augur.web.register(handle2, password2, {doNotFund: true}, function (result) {
                checkAccount(augur, result);
                augur.db.get(handle2, function (rec) {
                    assert.notProperty(rec, "error");
                    assert(rec.ciphertext);
                    assert(rec.iv);
                    assert(rec.kdfparams.salt);
                    assert.strictEqual(
                        new Buffer(rec.iv, "base64")
                            .toString("hex")
                            .length,
                        constants.IVSIZE*2
                    );
                    assert.strictEqual(
                        new Buffer(rec.kdfparams.salt, "base64")
                            .toString("hex")
                            .length,
                        constants.KEYSIZE*2
                    );
                    assert.strictEqual(
                        new Buffer(rec.ciphertext, "base64")
                            .toString("hex")
                            .length,
                        constants.KEYSIZE*2
                    );
                    augur.web.logout();
                    done();
                });
            });
        });
    });

    it("persistent register: " + handle3 + " / " + password3, function (done) {
        this.timeout(constants.TIMEOUT);
        var augur = utils.setup(require("../../src"), process.argv.slice(2));
        augur.db.get(handle3, function (record) {
            assert.strictEqual(record.error, 99);
            augur.web.register(handle3, password3, {
                doNotFund: true,
                persist: true
            }, function (result) {
                if (result && result.error) {
                    augur.web.logout();
                    return done(result);
                }
                assert(!result.error);
                assert(result.privateKey);
                assert(result.address);
                assert.strictEqual(
                    result.privateKey.toString("hex").length,
                    constants.KEYSIZE*2
                );
                assert.strictEqual(result.address.length, 42);
                augur.db.get(handle3, function (rec) {
                    if (rec && rec.error) {
                        augur.web.logout();
                        return done(rec);
                    }
                    assert(!rec.error);
                    assert(rec.ciphertext);
                    assert(rec.iv);
                    assert(rec.kdfparams.salt);
                    assert.isObject(augur.web.account.keystore);
                    assert.strictEqual(
                        new Buffer(rec.iv, "base64")
                            .toString("hex")
                            .length,
                        constants.IVSIZE*2
                    );
                    assert.strictEqual(
                        new Buffer(rec.kdfparams.salt, "base64")
                            .toString("hex")
                            .length,
                        constants.KEYSIZE*2
                    );
                    assert.strictEqual(
                        new Buffer(rec.ciphertext, "base64")
                            .toString("hex")
                            .length,
                        constants.KEYSIZE*2
                    );
                    var stored = augur.db.get('');
                    assert.strictEqual(stored.handle, handle3);
                    assert.strictEqual(abi.hex(stored.privateKey), abi.hex(augur.web.account.privateKey));
                    assert.strictEqual(stored.address, augur.web.account.address);
                    assert.isObject(stored.keystore);
                    assert.isObject(augur.web.account.keystore);
                    assert.deepEqual(stored.keystore, augur.web.account.keystore);
                    augur.web.logout();
                    done();
                });
            });
        });
    });
});

describe("Login", function () {

    it("login and decrypt the stored private key", function (done) {
        this.timeout(constants.TIMEOUT);
        var augur = utils.setup(require("../../src"), process.argv.slice(2));
        augur.web.login(handle, password, function (user) {
            assert.notProperty(user, "error");
            assert.isTrue(Buffer.isBuffer(user.privateKey));
            assert.isString(user.address);
            assert.isObject(user.keystore);
            assert.strictEqual(
                user.privateKey.toString("hex").length,
                constants.KEYSIZE*2
            );
            assert.strictEqual(user.address.length, 42);
            augur.web.logout();
            done();
        });
    });

    it("persistent login", function (done) {
        this.timeout(constants.TIMEOUT);
        var augur = utils.setup(require("../../src"), process.argv.slice(2));
        augur.web.login(handle, password, {persist: true}, function (user) {
            assert.notProperty(user, "error");
            assert.isTrue(Buffer.isBuffer(user.privateKey));
            assert.isString(user.address);
            assert.isObject(user.keystore);
            assert.strictEqual(
                user.privateKey.toString("hex").length,
                constants.KEYSIZE*2
            );
            assert.strictEqual(user.address.length, 42);
            var stored = augur.db.getPersistent();
            assert.strictEqual(stored.handle, handle);
            assert.strictEqual(abi.hex(stored.privateKey, true), abi.hex(augur.web.account.privateKey, true));
            assert.strictEqual(stored.address, augur.web.account.address);
            augur.web.logout();
            done();
        });
    });

    it("login twice as the same user", function (done) {
        this.timeout(constants.TIMEOUT);
        var augur = utils.setup(require("../../src"), process.argv.slice(2));
        augur.web.login(handle, password, function (user) {
            assert.notProperty(user, "error");
            assert.isTrue(Buffer.isBuffer(user.privateKey));
            assert.isString(user.address);
            assert.isObject(user.keystore);
            assert.strictEqual(
                user.privateKey.toString("hex").length,
                constants.KEYSIZE*2
            );
            assert.strictEqual(user.address.length, 42);
            augur.web.login(handle, password, function (same_user) {
                assert(!same_user.error);
                assert.strictEqual(
                    user.privateKey.toString("hex"),
                    same_user.privateKey.toString("hex")
                );
                assert.strictEqual(user.address, same_user.address);
                done();
            });
        });
    });

    it("fail with error 403 when given an incorrect handle", function (done) {
        this.timeout(constants.TIMEOUT);
        var augur = utils.setup(require("../../src"), process.argv.slice(2));
        var bad_handle = utils.sha256(new Date().toString());
        augur.web.login(bad_handle, password, function (user) {
            assert.strictEqual(user.error, 403);
            done();
        });
    });

    it("fail with error 403 when given a blank handle", function (done) {
        this.timeout(constants.TIMEOUT);
        var augur = utils.setup(require("../../src"), process.argv.slice(2));
        augur.web.login("", password, function (user) {
            assert.strictEqual(user.error, 403);
            done();
        });
    });

    it("fail with error 403 when given a blank password", function (done) {
        this.timeout(constants.TIMEOUT);
        var augur = utils.setup(require("../../src"), process.argv.slice(2));
        augur.web.login(handle, "", function (user) {
            assert.strictEqual(user.error, 403);
            done();
        });
    });

    it("fail with error 403 when given a blank handle and a blank password", function (done) {
        this.timeout(constants.TIMEOUT);
        var augur = utils.setup(require("../../src"), process.argv.slice(2));
        augur.web.login("", "", function (user) {
            assert.strictEqual(user.error, 403);
            done();
        });
    });

    it("fail with error 403 when given an incorrect password", function (done) {
        this.timeout(constants.TIMEOUT);
        var augur = utils.setup(require("../../src"), process.argv.slice(2));
        var bad_password = utils.sha256(Math.random().toString(36).substring(4));
        augur.web.login(handle, bad_password, function (user) {
            assert.strictEqual(user.error, 403);
            done();
        });
    });

    it("fail with error 403 when given an incorrect handle and an incorrect password", function (done) {
        this.timeout(constants.TIMEOUT);
        var augur = utils.setup(require("../../src"), process.argv.slice(2));
        var bad_handle = utils.sha256(new Date().toString());
        var bad_password = utils.sha256(Math.random().toString(36).substring(4));
        augur.web.login(handle, bad_password, function (user) {
            assert.strictEqual(user.error, 403);
            done();
        });
    });

});

describe("Export key", function () {

    it("export keystore object", function (done) {
        this.timeout(constants.TIMEOUT);
        augur.web.login(handle, password, function (user) {
            assert.notProperty(user, "error");
            assert.isTrue(Buffer.isBuffer(user.privateKey));
            assert.isString(user.address);
            assert.strictEqual(
                user.privateKey.toString("hex").length,
                constants.KEYSIZE*2
            );
            assert.strictEqual(user.address.length, 42);
            var keystore = augur.web.exportKey();
            assert.strictEqual(keystore.address, abi.strip_0x(user.address));
            assert.strictEqual(keystore.Crypto.cipher, keys.constants.cipher);
            assert.strictEqual(keystore.Crypto.kdf, constants.KDF);
            assert.strictEqual(keystore.Crypto.kdfparams.dklen, constants.KEYSIZE);
            if (keystore.Crypto.kdf === "pbkdf2") {
                assert.strictEqual(keystore.Crypto.kdfparams.c, constants.ROUNDS);
                assert.strictEqual(keystore.Crypto.kdfparams.prf, keys.constants.pbkdf2.prf);
            } else if (keystore.Crypto.kdf === "scrypt") {
                assert.strictEqual(keystore.Crypto.kdfparams.n, constants.ROUNDS);
                assert.strictEqual(keystore.Crypto.kdfparams.r, keys.constants.scrypt.r);
                assert.strictEqual(keystore.Crypto.kdfparams.p, keys.constants.scrypt.p);
            }
            augur.db.get(handle, function (account) {
                assert.isObject(account);
                assert.strictEqual(account.handle, handle);
                assert.strictEqual(account.ciphertext.toString("hex"), keystore.Crypto.ciphertext);
                assert.strictEqual(account.iv.toString("hex"), keystore.Crypto.cipherparams.iv);
                assert.strictEqual(account.kdf, keystore.Crypto.kdf);
                assert.strictEqual(account.kdfparams.salt.toString("hex"), keystore.Crypto.kdfparams.salt);
                done();
            });
        });
    });

});

describe("Persist", function () {

    it("use a stored (persistent) account", function (done) {
        this.timeout(constants.TIMEOUT);
        augur.web.logout();
        assert.isTrue(augur.db.removePersistent());
        assert.notProperty(augur.web.account, "handle");
        assert.notProperty(augur.web.account, "address");
        assert.notProperty(augur.web.account, "privateKey");
        assert.notProperty(augur.web.account, "keystore");
        assert.isNull(augur.db.getPersistent());
        var handle = utils.sha256(new Date().toString()).slice(0, 10);
        var password = "tinypassword";
        augur.web.register(handle, password, {doNotFund: true}, function (account) {
            assert.notProperty(account, "error");
            assert.isTrue(augur.db.putPersistent(account));
            var persist = augur.web.persist();
            assert.strictEqual(persist.handle, account.handle);
            assert.strictEqual(persist.privateKey.toString("hex"), account.privateKey.toString("hex"));
            assert.strictEqual(persist.address, account.address);
            assert.strictEqual(augur.web.account.handle, account.handle);
            assert.strictEqual(augur.web.account.privateKey.toString("hex"), account.privateKey.toString("hex"));
            assert.strictEqual(augur.web.account.address, account.address);
            assert.isObject(augur.web.account.keystore);
            augur.web.logout();
            assert.notProperty(augur.web.account, "handle");
            assert.notProperty(augur.web.account, "address");
            assert.notProperty(augur.web.account, "privateKey");
            assert.notProperty(augur.web.account, "keystore");
            assert.isNull(augur.db.getPersistent());
            done();
        });
    });

});

describe("Logout", function () {

    it("logout and unset the account object", function (done) {
        this.timeout(constants.TIMEOUT);
        var augur = utils.setup(require("../../src"), process.argv.slice(2));
        augur.web.login(handle, password, function (user) {
            if (user.error) {
                augur.web.logout();
                return done(new Error(utils.pp(user)));
            }
            assert.strictEqual(user.handle, handle);
            for (var i = 0; i < 2; ++i) {
                augur.web.logout();
                assert.notProperty(augur.web.account, "handle");
                assert.notProperty(augur.web.account, "address");
                assert.notProperty(augur.web.account, "privateKey");
            }
            assert.isNull(augur.db.getPersistent());
            done();
        });
    });

});

if (!process.env.CONTINUOUS_INTEGRATION) {

    describe("Duplicate accounts", function () {

        it("account 1 + same password", function (done) {
            this.timeout(constants.TIMEOUT);
            var augur = utils.setup(require("../../src"), process.argv.slice(2));
            augur.web.register(handle, password, {doNotFund: true}, function (result) {
                assert.strictEqual(result.error, 422);
                assert.notProperty(result, "address");
                assert.notProperty(result, "privateKey");
                assert.notProperty(result, "keystore");
                assert.notProperty(result, "handle");
                assert.notProperty(augur.web.account, "address");
                assert.notProperty(augur.web.account, "privateKey");
                assert.notProperty(augur.web.account, "keystore");
                assert.notProperty(augur.web.account, "handle");
                augur.db.get(handle, function (record) {
                    assert.isObject(record);
                    assert.notProperty(record, "error");
                    augur.web.register(handle, password, {
                        doNotFund: true,
                        persist: true
                    }, function (result) {
                        assert.strictEqual(result.error, 422);
                        assert.notProperty(result, "address");
                        assert.notProperty(result, "privateKey");
                        assert.notProperty(result, "keystore");
                        assert.notProperty(result, "handle");
                        assert.notProperty(augur.web.account, "address");
                        assert.notProperty(augur.web.account, "privateKey");
                        assert.notProperty(augur.web.account, "keystore");
                        assert.notProperty(augur.web.account, "handle");
                        augur.db.get(handle, function (record) {
                            assert.isObject(record);
                            assert.notProperty(record, "error");

                            // verify login with correct password still works
                            augur.web.login(handle, password, function (user) {
                                assert.notProperty(user, "error");
                                assert.isTrue(Buffer.isBuffer(user.privateKey));
                                assert.isString(user.address);
                                assert.isObject(user.keystore);
                                assert.strictEqual(
                                    user.privateKey.toString("hex").length,
                                    constants.KEYSIZE*2
                                );
                                assert.strictEqual(user.address.length, 42);
                                augur.web.logout();

                                // verify login with bad password does not work
                                augur.web.login(handle, password + "1", function (user) {
                                    assert.strictEqual(user.error, 403);
                                    assert.notProperty(user, "address");
                                    assert.notProperty(user, "privateKey");
                                    assert.notProperty(user, "keystore");
                                    assert.notProperty(user, "handle");
                                    assert.notProperty(augur.web.account, "address");
                                    assert.notProperty(augur.web.account, "privateKey");
                                    assert.notProperty(augur.web.account, "keystore");
                                    assert.notProperty(augur.web.account, "handle");
                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });

        it("account 2 + different password", function (done) {
            this.timeout(constants.TIMEOUT);
            var augur = utils.setup(require("../../src"), process.argv.slice(2));
            var badPassword = password2 + "1";
            augur.web.register(handle2, badPassword, {doNotFund: true}, function (result) {
                assert.strictEqual(result.error, 422);
                assert.notProperty(result, "address");
                assert.notProperty(result, "privateKey");
                assert.notProperty(result, "keystore");
                assert.notProperty(result, "handle");
                assert.notProperty(augur.web.account, "address");
                assert.notProperty(augur.web.account, "privateKey");
                assert.notProperty(augur.web.account, "keystore");
                assert.notProperty(augur.web.account, "handle");
                augur.db.get(handle2, function (record) {
                    assert.isObject(record);
                    assert.notProperty(record, "error");
                    augur.web.register(handle2, badPassword, {
                        doNotFund: true,
                        persist: true
                    }, function (result) {
                        assert.strictEqual(result.error, 422);
                        assert.notProperty(result, "address");
                        assert.notProperty(result, "privateKey");
                        assert.notProperty(result, "keystore");
                        assert.notProperty(result, "handle");
                        assert.notProperty(augur.web.account, "address");
                        assert.notProperty(augur.web.account, "privateKey");
                        assert.notProperty(augur.web.account, "keystore");
                        assert.notProperty(augur.web.account, "handle");
                        augur.db.get(handle2, function (record) {
                            assert.isObject(record);
                            assert.notProperty(record, "error");

                            // verify login with correct password still works
                            augur.web.login(handle2, password2, function (user) {
                                assert.notProperty(user, "error");
                                assert.isTrue(Buffer.isBuffer(user.privateKey));
                                assert.isString(user.address);
                                assert.isObject(user.keystore);
                                assert.strictEqual(
                                    user.privateKey.toString("hex").length,
                                    constants.KEYSIZE*2
                                );
                                assert.strictEqual(user.address.length, 42);
                                augur.web.logout();

                                // verify login with bad password does not work
                                augur.web.login(handle2, badPassword, function (user) {
                                    assert.strictEqual(user.error, 403);
                                    assert.notProperty(user, "address");
                                    assert.notProperty(user, "privateKey");
                                    assert.notProperty(user, "keystore");
                                    assert.notProperty(user, "handle");
                                    assert.notProperty(augur.web.account, "address");
                                    assert.notProperty(augur.web.account, "privateKey");
                                    assert.notProperty(augur.web.account, "keystore");
                                    assert.notProperty(augur.web.account, "handle");
                                    done();
                                });
                            });
                        });
                    });
                });
            });
        });

        it("account 1 + same password + full-sequence fund", function (done) {
            this.timeout(constants.TIMEOUT);
            var augur = utils.setup(require("../../src"), process.argv.slice(2));
            augur.web.register(handle, password, {
                onRegistered: function (account) {
                    assert.strictEqual(account.error, 422);
                    assert.notProperty(account, "address");
                    assert.notProperty(account, "privateKey");
                    assert.notProperty(account, "keystore");
                    assert.notProperty(account, "handle");
                    assert.notProperty(augur.web.account, "address");
                    assert.notProperty(augur.web.account, "privateKey");
                    assert.notProperty(augur.web.account, "keystore");
                    assert.notProperty(augur.web.account, "handle");
                    augur.db.get(handle, function (record) {
                        assert.isObject(record);
                        assert.notProperty(record, "error");

                        // verify login with correct password still works
                        augur.web.login(handle, password, function (user) {
                            checkAccount(augur, user);
                            augur.web.logout();

                            // verify login with bad password does not work
                            augur.web.login(handle, password + "1", function (user) {
                                assert.strictEqual(user.error, 403);
                                assert.notProperty(user, "address");
                                assert.notProperty(user, "privateKey");
                                assert.notProperty(user, "keystore");
                                assert.notProperty(user, "handle");
                                assert.notProperty(augur.web.account, "address");
                                assert.notProperty(augur.web.account, "privateKey");
                                assert.notProperty(augur.web.account, "keystore");
                                assert.notProperty(augur.web.account, "handle");
                                done();
                            });
                        });
                    });
                },
                onSendEther: done,
                onFunded: done
            });
        });

        it("account 1 + same password + persistence + full-sequence fund", function (done) {
            this.timeout(constants.TIMEOUT);
            var augur = utils.setup(require("../../src"), process.argv.slice(2));
            augur.web.register(handle, password, {persist: true}, {
                onRegistered: function (account) {
                    assert.strictEqual(account.error, 422);
                    assert.notProperty(account, "address");
                    assert.notProperty(account, "privateKey");
                    assert.notProperty(account, "keystore");
                    assert.notProperty(account, "handle");
                    assert.notProperty(augur.web.account, "address");
                    assert.notProperty(augur.web.account, "privateKey");
                    assert.notProperty(augur.web.account, "keystore");
                    assert.notProperty(augur.web.account, "handle");
                    augur.db.get(handle, function (record) {
                        assert.isObject(record);
                        assert.notProperty(record, "error");

                        // verify login with correct password still works
                        augur.web.login(handle, password, function (user) {
                            checkAccount(augur, user);
                            augur.web.logout();

                            // verify login with bad password does not work
                            augur.web.login(handle, password + "1", function (user) {
                                assert.strictEqual(user.error, 403);
                                assert.notProperty(user, "address");
                                assert.notProperty(user, "privateKey");
                                assert.notProperty(user, "keystore");
                                assert.notProperty(user, "handle");
                                assert.notProperty(augur.web.account, "address");
                                assert.notProperty(augur.web.account, "privateKey");
                                assert.notProperty(augur.web.account, "keystore");
                                assert.notProperty(augur.web.account, "handle");
                                done();
                            });
                        });
                    });
                },
                onSendEther: done,
                onFunded: done
            });
        });
    });

    describe("Fund", function () {

        it("funding sequence: " + handle, function (done) {
            this.timeout(constants.TIMEOUT*2);
            var augur = utils.setup(require("../../src"), process.argv.slice(2));
            augur.web.login(handle, password, function (account) {
                checkAccount(augur, account);
                var recipient = account.address;
                var initial_balance = abi
                    .bignum(augur.rpc.balance(recipient))
                    .dividedBy(constants.ETHER);
                augur.web.fund({address: recipient}, {
                    onRegistered: function (account) {
                        console.log("onRegistered:", account);
                        assert.strictEqual(account.address, recipient);
                    },
                    onSendEther: function (account) {
                        console.log("onSendEther:", account);
                        assert.strictEqual(account.address, recipient);
                        var final_balance = abi
                            .bignum(augur.rpc.balance(recipient))
                            .dividedBy(constants.ETHER);
                        var delta = final_balance.sub(initial_balance).toNumber();
                        assert.isAbove(Math.abs(delta), 4);
                    },
                    onFunded: function (response) {
                        assert.notProperty(response, "error");
                        assert.strictEqual(response.callReturn, "1");
                        augur.getRepBalance(augur.branches.dev, recipient, function (repBalance) {
                            assert.notProperty(repBalance, "error");
                            assert.strictEqual(abi.number(repBalance), 47);
                            augur.getCashBalance(recipient, function (cashBalance) {
                                console.log("cash balance:", recipient, cashBalance);
                                assert.notProperty(cashBalance, "error");
                                assert.isAbove(abi.number(cashBalance), 9999);
                                augur.web.logout();
                                done();
                            });
                        });
                    }
                });
            });
        });
    });
}

describe("Transaction signing", function () {

    // sign tx with private key
    it("sign raw transaction using private key", function () {
        var tx = new EthTx({
            nonce: "00",
            gasPrice: "09184e72a000", 
            gasLimit: "2710",
            to: abi.format_address("0000000000000000000000000000000000000001"),
            value: "00", 
            data: "7f7465737432000000000000000000000000000000000000000000000000000000600057"
        });
        tx.sign(privateKey);
        var signed = "f8ba8230308c3039313834653732613030308432373130940000000000000000"+
                     "000000000000000000000001823030b848376637343635373337343332303030"+
                     "3030303030303030";

        // RLP serialization
        var serializedTx = tx.serialize().toString("hex");
        assert.strictEqual(serializedTx.slice(0, 144), signed);
        assert.strictEqual(serializedTx.length, 376);
    });

    // create a new contract
    it("transaction to create a new contract", function () {
        var tx = new EthTx();
        tx.nonce = 0;
        tx.gasPrice = 100;
        tx.gasLimit = 1000;
        tx.value = 0;
        tx.data = "7f4e616d65526567000000000000000000000000000000000000000000000000"+
                  "003057307f4e616d655265670000000000000000000000000000000000000000"+
                  "0000000000573360455760415160566000396000f20036602259604556330e0f"+
                  "600f5933ff33560f601e5960003356576000335700604158600035560f602b59"+
                  "0033560f60365960003356573360003557600035335700";
        tx.sign(privateKey);
        var signed = "f9017b80648203e88080b9012e37663465363136643635353236353637303030"+
                     "3030303030303030303030303030303030303030303030303030303030303030"+
                     "3030303030303030303030303030303330353733303766346536313664363535"+
                     "3236353637303030303030303030303030303030303030303030303030303030"+
                     "3030303030303030303030303030303030303030303030353733333630343535"+
                     "3736";
        var serializedTx = tx.serialize().toString("hex");
        assert.strictEqual(serializedTx.slice(0, 324), signed);
        assert.strictEqual(serializedTx.length, 764)
    });

    // up-front cost calculation:
    // fee = data length in bytes * 5
    //     + 500 Default transaction fee
    //     + gasAmount * gasPrice
    it("calculate up-front transaction cost", function () {
        var tx = new EthTx();
        tx.nonce = 0;
        tx.gasPrice = 100;
        tx.gasLimit = 1000;
        tx.value = 0;
        tx.data = "7f4e616d65526567000000000000000000000000000000000000000000000000"+
                  "003057307f4e616d655265670000000000000000000000000000000000000000"+
                  "0000000000573360455760415160566000396000f20036602259604556330e0f"+
                  "600f5933ff33560f601e5960003356576000335700604158600035560f602b59"+
                  "0033560f60365960003356573360003557600035335700";
        tx.sign(privateKey);
        assert.strictEqual(tx.getUpfrontCost().toString(), "100000");
    });

    // decode incoming tx using rlp: rlp.decode(itx)
    // (also need to check sender's account to see if they have at least amount of the fee)
    it("should verify sender's signature", function () {
        var rawTx = {
            nonce: "0x00",
            gasPrice: "0x09184e72a000", 
            gasLimit: "0x2710",
            to: "0x0000000000000000000000000000000000000000", 
            value: "0x00", 
            data: "0x7f7465737432000000000000000000000000000000000000000000000000000000600057"
        };
        var tx2 = new EthTx(rawTx);
        tx2.sign(privateKey);
        assert.strictEqual(abi.hex(tx2.getSenderAddress()), address);
        assert.isTrue(tx2.verifySignature());
    });

});

describe("Contract methods", function () {

    if (!process.env.CONTINUOUS_INTEGRATION) {

        describe("Set transaction nonce", function () {

            it("duplicate transaction: invoke reputationFaucet twice", function (done) {
                this.timeout(constants.TIMEOUT*2);
                var augur = utils.setup(require("../../src"), process.argv.slice(2));
                augur.web.login(handle, password, function (user) {
                    if (user.error) {
                        augur.web.logout();
                        return done(new Error(utils.pp(user)));
                    }
                    assert.strictEqual(
                        user.address,
                        augur.web.account.address
                    );
                    var count = 0;
                    augur.reputationFaucet({
                        branch: augur.branches.dev,
                        onSent: function (r) {
                            assert.property(r, "txHash");
                            assert.property(r, "callReturn");
                            assert.strictEqual(r.callReturn, "1");
                        },
                        onSuccess: function (r) {
                            assert.property(r, "txHash");
                            assert.property(r, "callReturn");
                            assert.property(r, "blockHash");
                            assert.property(r, "blockNumber");
                            assert.isAbove(parseInt(r.blockNumber), 0);
                            assert.strictEqual(r.from, user.address);
                            assert.strictEqual(r.to, augur.contracts.faucets);
                            assert.strictEqual(Number(r.value), 0);
                            if (++count === 2) done();
                        },
                        onFailed: done
                    });
                    augur.reputationFaucet({
                        branch: augur.branches.dev,
                        onSent: function (r) {
                            assert.property(r, "txHash");
                            assert.property(r, "callReturn");
                            assert.strictEqual(r.callReturn, "1");
                        },
                        onSuccess: function (r) {
                            assert.property(r, "txHash");
                            assert.property(r, "callReturn");
                            assert.property(r, "blockHash");
                            assert.property(r, "blockNumber");
                            assert.isAbove(parseInt(r.blockNumber), 0);
                            assert.strictEqual(r.from, user.address);
                            assert.strictEqual(r.to, augur.contracts.faucets);
                            assert.strictEqual(Number(r.value), 0);
                            if (++count === 2) done();
                        },
                        onFailed: done
                    });
                });
            });
        });
    }

    describe("Call", function () {

        it("call getBranches using web.invoke", function (done) {
            this.timeout(constants.TIMEOUT);
            var augur = utils.setup(require("../../src"), process.argv.slice(2));
            augur.web.login(handle, password, function (user) {
                if (user.error) {
                    augur.web.logout();
                    return done(new Error(utils.pp(user)));
                }
                assert.strictEqual(
                    user.address,
                    augur.web.account.address
                );

                // sync
                var branches = augur.web.invoke(augur.tx.getBranches);
                assert.isAbove(branches.length, 0);
                assert.isArray(branches);
                assert.strictEqual(
                    augur.rpc.encodeResult(
                        branches[0],
                        augur.tx.getBranches.returns
                    ),
                    augur.branches.dev
                );

                // async
                augur.web.invoke(augur.tx.getBranches, function (branches) {
                    assert.isAbove(branches.length, 0);
                    assert.isArray(branches);
                    assert.strictEqual(
                        augur.rpc.encodeResult(
                            branches[0],
                            augur.tx.getBranches.returns
                        ),
                        augur.branches.dev
                    );
                    augur.web.logout();
                    done();
                });
            });
        });

    });

    if (!process.env.CONTINUOUS_INTEGRATION) {

        describe("Send transaction", function () {

            it("sign and send transaction using account 1", function (done) {
                this.timeout(constants.TIMEOUT);
                var augur = utils.setup(require("../../src"), process.argv.slice(2));
                augur.web.login(handle, password, function (user) {
                    if (user.error) {
                        augur.web.logout();
                        return done(new Error(utils.pp(user)));
                    }
                    var tx = utils.copy(augur.tx.reputationFaucet);
                    tx.params = augur.branches.dev;
                    augur.web.invoke(tx, function (txhash) {
                        if (txhash.error) {
                            augur.web.logout();
                            return done(txhash);
                        }
                        assert(txhash);
                        augur.rpc.getTx(txhash, function (confirmTx) {
                            if (confirmTx.error) {
                                augur.web.logout();
                                return done(confirmTx);
                            }
                            assert(confirmTx.hash);
                            assert(confirmTx.from);
                            assert(confirmTx.to);
                            assert.strictEqual(txhash, confirmTx.hash);
                            assert.strictEqual(confirmTx.from, user.address);
                            assert.strictEqual(confirmTx.to, tx.to);
                            augur.web.logout();
                            done();
                        });
                    });
                });
            });

            it("detect logged in user and default to web.invoke", function (done) {
                this.timeout(constants.TIMEOUT*4);
                var augur = utils.setup(require("../../src"), process.argv.slice(2));
                augur.web.login(handle, password, function (user) {
                    if (user.error) {
                        augur.web.logout();
                        return done(new Error(utils.pp(user)));
                    }
                    assert.strictEqual(
                        user.address,
                        augur.web.account.address
                    );
                    augur.reputationFaucet({
                        branch: augur.branches.dev,
                        onSent: function (r) {
                            // sent
                            assert.property(r, "txHash");
                            assert.property(r, "callReturn");
                        },
                        onSuccess: function (r) {
                            // success
                            assert.property(r, "txHash");
                            assert.property(r, "callReturn");
                            assert.property(r, "blockHash");
                            assert.property(r, "blockNumber");
                            assert.isAbove(parseInt(r.blockNumber), 0);
                            assert.strictEqual(r.from, user.address);
                            assert.strictEqual(r.to, augur.contracts.faucets);
                            assert.strictEqual(Number(r.value), 0);
                            done();
                        },
                        onFailed: done
                    });
                });
            });

        });
    }
});
