const moment = require('moment');
const Base64 = require('js-base64').Base64;

//uuid格式：年月日时分秒3位毫秒+3位随机数，共20位  ===>   20190312162455043167
exports.uuid = function uuid() {
    let uuid = moment().format("YYYYMMDDHHmmssSSS");
    // 把含有三个empty的数组以0为分界符合成一个字符串  slice(-3)取倒数后三个，不包括结尾但包括开始
    uuid += (Array(3).join(0) + Math.random()*100).slice(-3);
    return uuid;
};

exports.decode = function decode(data){
    return Base64.decode(data);
}

exports.encode = function encode(data){
    return Base64.encode(data);
}
