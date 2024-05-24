function modifyResponse(content) {
    if (typeof content === 'string') {
        return content + ' test';
    }
    console.error('Expected a string but got:', typeof content);
    return content;
}

module.exports = { modifyResponse };