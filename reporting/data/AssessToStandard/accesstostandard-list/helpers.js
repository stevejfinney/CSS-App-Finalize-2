function timeStamp() {
    return new Date().toLocaleString();
}

function fixedDecimal (floatValue) {
    if (typeof floatValue !== 'undefined') {
        return floatValue.toFixed(2);
    }
}

function formatDate(datestr) {
    var d = new Date(datestr);
    return d.toLocaleString('default', { month: 'long' }) + " " + d.getDate()  + ", " +  d.getFullYear();
}