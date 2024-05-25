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

        try {
            const parsedJson = JSON.parse(jsonString);
            const result = {
                msg: naturalLanguagePart.trim(),
                json: parsedJson
            };
            return result;
        } catch (error) {
            console.error('Failed to parse JSON:', error);
            return {
                msg: jsonString.trim(),
                json: null
            };
        }
    }
    console.error('Expected a string but got:', typeof content);
    return content;
}

module.exports = { modifyResponse };