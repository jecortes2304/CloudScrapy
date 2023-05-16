const crypto = require("crypto");

function encryptDecrypt(){

    function encrypt(dataToEncrypt, publicKey){
        let encryptedData
        try {
            encryptedData = crypto.publicEncrypt(
                {
                    key: publicKey,
                    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                    oaepHash: "sha1",
                },
                Buffer.from(dataToEncrypt)
            );
        }catch (error){
            console.log(`Error encrypting text: ${error}`)
        }
        return encryptedData.toString("base64")
    }

    function decrypt(dataToDecrypt, privateKey){
        let decryptedData
        try {
            decryptedData = crypto.privateDecrypt(
                {
                    key: privateKey,
                    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                    oaepHash: "sha1",
                },
                Buffer.from(dataToDecrypt, "base64")
            );
        }catch (error){
            console.log(`Error decrypting text: ${error}`)
        }
        return decryptedData.toString("utf-8")
    }

    function generateKeysPair(){
        const {privateKey, publicKey} =  crypto.generateKeyPairSync("rsa", {
            modulusLength: 1024,
        })
        const exportedPublicKeyBuffer = publicKey.export({
            type: "pkcs1",
            format: "pem",
        });

        const exportedPrivateKeyBuffer = privateKey.export({
            type: "pkcs1",
            format: "pem",
        });

        return {exportedPrivateKeyBuffer, exportedPublicKeyBuffer}
    }

    return Object.freeze({
        encrypt,
        decrypt,
        generateKeysPair
    })
}


module.exports = {encryptDecrypt};


