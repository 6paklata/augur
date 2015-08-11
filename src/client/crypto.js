/**
 * ethereum key stuff
 */

"use strict";

var crypto;
if ((typeof module !== "undefined") && process && !process.browser) {
    crypto = require("crypto");
} else {
    crypto = require("crypto-browserify");
}
var uuid = require("node-uuid");
var EthUtil = require("ethereumjs-util");
var EC = require("elliptic").ec;
var constants = require("../constants");
var validator = require("validator");
var utils = require("../utilities");
var keccak = require("../../lib/keccak");
var scrypt = require("../../lib/scrypt")(constants.scrypt.maxmem);
var log = console.log;

module.exports = function (kdf) {

    return {

        // Option to use scrypt key derivation function
        scrypt: kdf,

        ecdsa: new EC("secp256k1"),

        /**
         * Symmetric private key encryption using secret (derived) key.
         * @param {string} plaintext Text to be encrypted.
         * @param {string|buffer} key Secret key.
         * @param {string|buffer} iv Initialization vector.
         * @return {string} Base64 encrypted text.
         */
        encrypt: function (plaintext, key, iv) {
            var cipher, ciphertext;
            cipher = crypto.createCipheriv(constants.CIPHER, key, iv);
            ciphertext = cipher.update(plaintext, "hex", "base64");
            return ciphertext + cipher.final("base64");
        },

        /**
         * Symmetric private key decryption using secret (derived) key.
         * @param {string} ciphertext Text to be decrypted.
         * @param {string|buffer} key Secret key.
         * @param {string|buffer} iv Initialization vector.
         * @return {string} Hex decryped text.
         */
        decrypt: function (ciphertext, key, iv) {
            var decipher, plaintext;
            decipher = crypto.createDecipheriv(constants.CIPHER, key, iv);
            plaintext = decipher.update(ciphertext, "base64", "hex");
            return plaintext + decipher.final("hex");
        },

        /**
         * Derive Ethereum address from private key.
         * @param {string|buffer} privateKey ECDSA private key.
         * @return {string} Hex-encoded Ethereum address.
         */
        privateKeyToAddress: function (privateKey) {
            if (privateKey) {
                if (privateKey.constructor === String) {
                    if (validator.isHexadecimal(privateKey)) {
                        privateKey = new Buffer(privateKey, "hex");
                    } else if (validator.isBase64(privateKey)) {
                        privateKey = new Buffer(privateKey, "base64");
                    } else {
                        privateKey = new Buffer(privateKey);
                    }
                }
                var pubKey = new Buffer(this.ecdsa.keyFromPrivate(privateKey).getPublic("arr"));
                return "0x" + EthUtil.pubToAddress(pubKey).toString("hex");
            }
        },

        /**
         * Calculate message authentication code from secret (derived) key and
         * encrypted text.
         * @param {string|buffer} derivedKey Secret key derived from password.
         * @param {string|buffer} ciphertext Text encrypted with secret key.
         * @return {string} Hex-encoded MAC.
         */
        getMAC: function (derivedKey, ciphertext) {
            if (derivedKey !== undefined && derivedKey !== null &&
                ciphertext !== undefined && ciphertext !== null)
            {
                if (derivedKey.constructor === Buffer) {
                    derivedKey = derivedKey.toString("hex");
                }
                if (ciphertext.constructor === Buffer) {
                    ciphertext = ciphertext.toString("hex");
                }
                return keccak(utils.hex2utf16le(derivedKey.slice(32, 64) + ciphertext));
            }
        },

        /**
         * Derive secret key from password with key dervation function.
         * @param {string|buffer} password User-supplied password.
         * @param {string|buffer} salt Randomly generated salt.
         * @param {string=} kdf Key derivation function (default: pbkdf2).
         * @param {function=} cb Callback function (optional).
         * @return {buffer} Secret key derived from password.
         */
        deriveKey: function (password, salt, kdf, cb) {
            if (password && salt) {

                // convert strings to buffers
                if (password.constructor === String) {
                    password = new Buffer(password, "utf8");
                }
                if (salt.constructor === String) {
                    if (validator.isHexadecimal(salt)) {
                        salt = new Buffer(salt, "hex");
                    } else if (validator.isBase64(salt)) {
                        salt = new Buffer(salt, "base64");
                    } else {
                        salt = new Buffer(salt);
                    }
                }

                // use scrypt as key derivation function
                if (this.scrypt || kdf === "scrypt") {

                    try {
                        var derivedKey = new Buffer(
                            scrypt.to_hex(scrypt.crypto_scrypt(
                                password,
                                salt,
                                constants.scrypt.n,
                                constants.scrypt.r,
                                constants.scrypt.p,
                                constants.scrypt.dklen
                            )
                        ), "hex");

                        if (cb && cb.constructor === Function) {
                            cb(derivedKey);
                        } else {
                            return derivedKey; 
                        }

                    } catch (ex) {
                        if (cb && cb.constructor === Function) {
                            cb(ex);
                        } else {
                            return ex;
                        }
                    }

                // use default key derivation function (PBKDF2)
                } else {
                    if (cb && cb.constructor === Function) {
                        crypto.pbkdf2(
                            password,
                            salt,
                            constants.pbkdf2.c,
                            constants.pbkdf2.dklen,
                            constants.pbkdf2.hash,
                            function (ex, derivedKey) {
                                if (ex) return ex;
                                cb(derivedKey);
                            }
                        );
                    } else {
                        
                        try {
                            return crypto.pbkdf2Sync(
                                password,
                                salt,
                                constants.pbkdf2.c,
                                constants.pbkdf2.dklen,
                                constants.pbkdf2.hash
                            );

                        } catch (ex) {
                            return ex;
                        }
                    }
                }
            }
        },

        /**
         * Generate random numbers for private key, initialization vector,
         * and salt (for key derivation).
         * @param {function=} cb Callback function (optional).
         * @return {Object<string,buffer>} Private key, IV and salt.
         */
        generateKey: function (cb) {

            // asynchronous key generation if callback is provided
            if (cb && cb.constructor === Function) {

                // generate private key
                crypto.randomBytes(constants.KEYSIZE, function (ex, privateKey) {
                    if (ex) cb(ex);

                    // generate random initialization vector
                    crypto.randomBytes(constants.IVSIZE, function (ex, iv) {
                        if (ex) cb(ex);

                        // generate random salt
                        crypto.randomBytes(constants.KEYSIZE, function (ex, salt) {
                            if (ex) cb(ex);
                            
                            cb({
                                privateKey: privateKey,
                                iv: iv,
                                salt: salt
                            });
                        });

                    }); // crypto.randomBytes

                }); // crypto.randomBytes

            // synchronous key generation
            } else {

                try {
                    return {
                        privateKey: crypto.randomBytes(constants.KEYSIZE),
                        iv: crypto.randomBytes(constants.IVSIZE),
                        salt: crypto.randomBytes(constants.KEYSIZE)
                    };

                // couldn't generate key: not enough entropy?
                } catch (ex) {
                    return ex;
                }
            }
        },

        /**
         * Export private key to keystore secret-storage format.
         * @param {string|buffer} password User-supplied password.
         * @param {string|buffer} salt Randomly generated salt.
         * @param {string|buffer} iv Initialization vector.
         * @param {string=} kdf Key derivation function (default: pbkdf2).
         * @param {function=} cb Callback function (optional).
         * @return {Object}
         */
        dumpPrivateKey: function (password, privateKey, salt, iv, kdf, cb) {
            var self = this;

            if (iv.constructor === String) {
                if (validator.isHexadecimal(iv)) {
                    iv = new Buffer(iv, "hex");
                } else if (validator.isBase64(iv)) {
                    iv = new Buffer(iv, "base64");
                } else {
                    iv = new Buffer(iv);
                }
            }
            if (privateKey.constructor === String) {
                if (validator.isHexadecimal(privateKey)) {
                    privateKey = new Buffer(privateKey, "hex");
                } else if (validator.isBase64(privateKey)) {
                    privateKey = new Buffer(privateKey, "base64");
                } else {
                    privateKey = new Buffer(privateKey);
                }
            }

            var derivedKey = self.deriveKey(password, salt, kdf);

            // encryption key: first 16 bytes of derived key
            var ciphertext = utils.b642hex(self.encrypt(
                privateKey,
                derivedKey.slice(0, 16),
                iv
            ));

            // MAC: Keccak hash of the byte array formed by concatenating
            // the second 16 bytes of the derived key with the ciphertext
            // key's contents
            var mac = self.getMAC(derivedKey, ciphertext);

            // ID: random 128-bit UUID given to the secret key (a
            // privacy-preserving proxy for the secret key's address)
            var id = uuid.v4();

            // ethereum address
            var address = self.privateKeyToAddress(privateKey);

            var json = {
                address: address,
                crypto: {
                    cipher: constants.CIPHER,
                    ciphertext: ciphertext,
                    cipherparams: { iv: iv.toString("hex") },
                    mac: mac
                },
                id: id,
                version: 3
            };
            if (self.scrypt || kdf === "scrypt") {
                json.crypto.kdf = "scrypt";
                json.crypto.kdfparams = {
                    dklen: constants.scrypt.dklen,
                    n: constants.scrypt.n,
                    r: constants.scrypt.r,
                    p: constants.scrypt.p,
                    salt: salt
                };
            } else {
                json.crypto.kdf = "pbkdf2";
                json.crypto.kdfparams = {
                    c: constants.pbkdf2.c,
                    dklen: constants.pbkdf2.dklen,
                    prf: constants.pbkdf2.prf,
                    salt: salt
                };
            }
            if (cb && cb.constructor === Function) {
                cb(json);
            } else {
                return json;
            }
        },

        /**
         * Import private key from keystore secret-storage format.
         * @param {Object} json Keystore object.
         * @param {function=} cb Callback function (optional).
         * @return {Object}
         */
        loadPrivateKey: function (json, cb) {

        }

    };
};
