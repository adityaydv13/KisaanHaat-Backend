const CryptoJS=require("crypto-js");

exports.buildXVerify = (base64Payload, path, saltKey, saltIndex) => {
  // X-VERIFY = SHA256(base64Payload + path + saltKey) + "###" + saltIndex
  const toSign = base64Payload + path + saltKey;
  const sha = CryptoJS.SHA256(toSign).toString(CryptoJS.enc.Hex);
  return `${sha}###${saltIndex}`;
};

exports.buildXVerifyForGet = (path, saltKey, saltIndex) => {
  // For status GET: SHA256(path + saltKey) + "###" + saltIndex
  const toSign = path + saltKey;
  const sha = CryptoJS.SHA256(toSign).toString(CryptoJS.enc.Hex);
  return `${sha}###${saltIndex}`;
};
