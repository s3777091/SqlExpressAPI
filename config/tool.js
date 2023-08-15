function extractSpid(url) {
    const match = url.match(/spid=(\d+)/);
    if (match && match[1]) {
        return match[1];
    }
    return null;
}

module.exports = {
    extractSpid
};