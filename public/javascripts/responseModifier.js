/**
 * Funkcja modifyResponse modyfikuje zawartość odpowiedzi, usuwając otoczenia kodu JSON,
 * parsując go i zwracając obiekt zawierający część tekstową i obiekt JSON. Funkcja jest
 * potrzebna aby móc oddzielić część tekstową od JSONa, zwracanego przez AI
 *
 * @param {string} content - Zawartość odpowiedzi do modyfikacji.
 * @returns {object} - Obiekt zawierający część tekstową i sparsowany JSON.
 */
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
            err = error;
            console.error('Failed to parse JSON:', error);
        }

        const result = {
            msg: naturalLanguagePart !== '' ? naturalLanguagePart.trim() : err ? jsonString : '',
            json: parsedJson
        };

        return result;
    }

    console.error('Expected a string but got:', typeof content);
    return content;
}

module.exports = { modifyResponse };
