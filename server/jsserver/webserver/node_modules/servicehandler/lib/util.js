/**
 JSON obj to xml string.
 */
exports.xmlstringify = function (json) {
    var spacialChars = [/&/g, /</g, />/g, /\"/g, /'/g];
    var validChars = ["&amp;", "&lt;", "&gt;", "&quot;", "&apos;"];
    var replaceSpecialChar = function (s) {
        if (s) {
            for (var i = 0; i < spacialChars.length; i++) {
                s = s.replace(spacialChars[i], validChars[i]);
            }
            return s;
        }
    };

    var convert = function (buffer, json) {
        for (var tag in json) {
            //need to handle Array object specially
            if (json[tag].constructor == Array) {
                for (var i = 0; i < json[tag].length; i++) {
                    buffer.push("<" + tag + ">");
                    var item = json[tag][i];
                    if (item.constructor == Object) {
                        convert(buffer, item);
                    }
                    else if (item.constructor == Array) {
                        var obj = {};
                        obj[tag] = item;
                        convert(buffer, obj);
                    }
                    else if (item.constructor == String) {
                        buffer.push(replaceSpecialChar(item));
                    }
                    buffer.push("</" + tag + ">");
                }
            }
            else {
                buffer.push("<" + tag + ">");
                if (json[tag].constructor == Object) {
                    convert(buffer, json[tag]);
                }
                else if (json[tag].constructor == String) {
                    buffer.push(replaceSpecialChar(json[tag]));
                }
                buffer.push("</" + tag + ">");
            }
        }
        return buffer;
    };

    var buffer = ["<?xml version=\"1.0\" encoding=\"utf-8\"?>"];
    return convert(buffer, json).join("");
};


