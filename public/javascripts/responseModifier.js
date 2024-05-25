function modifyResponse(content) {
    if (typeof content === 'string') {
        let jsonString = content.trim();
        
        const prefixPattern = /^```json|^```JSON/;
        const suffixPattern = /```$/;

        let naturalLanguagePart = '';
        
        if (prefixPattern.test(jsonString)) {
            const prefixIndex = jsonString.search(prefixPattern);
            naturalLanguagePart = jsonString.substring(0, prefixIndex);
            jsonString = jsonString.substring(prefixIndex).replace(prefixPattern, '').trim();
        }

        if (suffixPattern.test(jsonString)) {
            jsonString = jsonString.replace(suffixPattern, '').trim();
        }

        console.log(jsonString);

        let err = null;
        let parsedJson = null;
        try {
            parsedJson = JSON.parse(jsonString);
        } catch (error) {
            err = error
            console.error('Failed to parse JSON:', error);
        }

        const result = {
            msg: naturalLanguagePart != '' ? naturalLanguagePart.trim() : err ? jsonString : '',
            json: parsedJson
        };

        return result;
    }

    console.error('Expected a string but got:', typeof content);
    return content;
}

module.exports = { modifyResponse };