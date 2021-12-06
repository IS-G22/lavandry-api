const { Int32 } = require("bson");

exports.asDate = (inputFormat) => {
    function pad(s) { return (s < 10) ? '0' + s : s; }
    var d = new Date(inputFormat)
    return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join('/')
}

exports.asTime = (inputFormat) => {
    return inputFormat.getHours() + ":" + inputFormat.getMinutes();
}

exports.MtoMs = (minutes) => {
    return minutes * 60 * 1000;
}
exports.HtoMs = (hours) => {
    return hours * 60 * 60 * 1000;
}
exports.DtoMs = (days = 1) => {
    return days * this.HtoMs(24);
}