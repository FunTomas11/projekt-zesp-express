const db = require('../db/db');
var express = require('express');
var router = express.Router();

const { randomUUID } = require('crypto');
const { Ollama } = require('ollama');
const { modifyResponse } = require("../public/javascripts/responseModifier");

const conversations = {};

/**
 * Formatuje szczegóły drinka do postaci JSON, usuwając niepotrzebne pola i formatując listy.
 *
 * @param {object} details - Szczegóły drinka.
 * @returns {string} - Sformatowany JSON.
 */
function formatDetails(details) {
  return JSON.stringify(details, (key, value) => {
    if (key == "id") { return undefined; }
    if (key === 'ingredients' && Array.isArray(value)) {
      return value.join(', ');
    }
    if (key === 'recipe' && typeof value === 'string') {
      return undefined;
    }
    return value;
  });
}

/**
 * Formatuje prompt do wysyłki do modelu AI, zawierający bazę danych drinków i wiadomość użytkownika.
 *
 * @param {object} availableDrinks - Dostępne drinki.
 * @param {string} userMessage - Wiadomość użytkownika.
 * @returns {string} - Sformatowany prompt.
 */
function formatPrompt(availableDrinks, userMessage) {
  const drinksFormatted = Object.entries(availableDrinks).map(([name, details]) => {
    return `${name}: ${formatDetails(details)}`;
  }).join(';');

  return `You are an expert mixologist. Your job is to use your own knowledge to help users discover beverages, including both alcoholic and non-alcoholic drinks. Use your knowledge to answer questions.

You have also received drink database, so you can look up the ingredients for a drink if you are not sure and reason about the question using this information:
${drinksFormatted}

User input:
${userMessage}

Answer:`;
}

/**
 * Pobiera obraz drinka z bazy danych na podstawie jego ID.
 *
 * @param {string} drinkId - ID drinka.
 * @returns {Promise<string>} - Ścieżka do obrazu drinka.
 */
function getDrinksImg(drinkId) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM images WHERE drinkId = ?';

    db.all(sql, [drinkId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const images = rows.map(row => ({
          path: row.path,
        }));

        let img = ''
        if (images.length > 0) {
          img = images[0].path
        }
        resolve(img);
      }
    });
  });
}

/**
 * Pobiera nazwy drinków z bazy danych.
 *
 * @returns {Promise<string[]>} - Lista nazw drinków.
 */
function getDrinkNames() {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT name FROM drinks';

    db.all(sql, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const drinks = rows.map(row => row.name);
        resolve(drinks);
      }
    });
  });
}

/**
 * Pobiera drinka z bazy danych na podstawie jego nazwy.
 *
 * @param {string} name - Nazwa drinka.
 * @returns {Promise<object>} - Szczegóły drinka.
 */
function getDrinkByName(name) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM drinks WHERE name = ?';

    db.all(sql, [name], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const drink = rows[0];
        resolve(drink);
      }
    });
  });
}

/**
 * Pobiera przepis drinka z bazy danych na podstawie jego ID.
 *
 * @param {string} drinkId - ID drinka.
 * @returns {Promise<string>} - Przepis drinka.
 */
function getDrinksRecipe(drinkId) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM drinks WHERE id = ?';

    db.all(sql, [drinkId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const drinks = rows.map(row => ({
          recipe: row.recipe,
        }));

        let recipe = ''
        if (drinks.length > 0) {
          recipe = drinks[0].recipe
        }
        resolve(recipe);
      }
    });
  });
}

/**
 * Pobiera składniki drinka z bazy danych na podstawie jego ID.
 *
 * @param {string} drinkId - ID drinka.
 * @returns {Promise<string[]>} - Lista składników drinka.
 */
function getDrinksIngredients(drinkId) {
  return new Promise((resolve, reject) => {
    const sql = `
    SELECT ingredients.name 
    FROM drink_ingredients
    LEFT JOIN ingredients ON drink_ingredients.ingredientId = ingredients.id
    WHERE drink_ingredients.drinkId = ?
    `;

    db.all(sql, [drinkId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const ingredients = rows.map(row => ({
          name: row.name,
        }));

        let names = [];
        if (ingredients.length > 0) {
          names = ingredients.map((ingredient) => ingredient.name);
        }
        resolve(names);
      }
    });
  });
}

/**
 * Pobiera wszystkie drinki z bazy danych wraz z ich składnikami i przepisami.
 *
 * @returns {Promise<object>} - Obiekt zawierający wszystkie drinki.
 */
function getDrinks() {
  return new Promise((resolve, reject) => {
    const drinksSql = 'SELECT * FROM drinks';

    db.all(drinksSql, [], (err, drinkRows) => {
      if (err) {
        return reject(err);
      }

      const drinks = {};

      const drinkPromises = drinkRows.map(drink => {
        return new Promise((resolve, reject) => {
          const ingredientsSql = `
            SELECT ingredients.name 
            FROM drink_ingredients
            LEFT JOIN ingredients ON drink_ingredients.ingredientId = ingredients.id
            WHERE drink_ingredients.drinkId = ?
          `;

          const recipeSql = 'SELECT recipe FROM drinks WHERE id = ?';

          const ingredientsPromise = new Promise((resolve, reject) => {
            db.all(ingredientsSql, [drink.id], (err, ingredientRows) => {
              if (err) {
                return reject(err);
              }
              const ingredientNames = ingredientRows.map(row => row.name);
              resolve(ingredientNames);
            });
          });

          const recipePromise = new Promise((resolve, reject) => {
            db.all(recipeSql, [drink.id], (err, recipeRows) => {
              if (err) {
                return reject(err);
              }
              const recipe = recipeRows.length > 0 ? recipeRows[0].recipe : '';
              resolve(recipe);
            });
          });

          Promise.all([ingredientsPromise, recipePromise])
              .then(([ingredients, recipe]) => {
                drinks[drink.name] = { id: drink.id, ingredients, recipe };
                resolve();
              })
              .catch(err => reject(err));
        });
      });

      Promise.all(drinkPromises)
          .then(() => resolve(drinks))
          .catch(err => reject(err));
    });
  });
}

/**
 * Endpoint GET /getDrinkInfo - Pobiera informacje o drinku na podstawie jego nazwy.
 */
router.get('/getDrinkInfo', async (req, res) => {
  const drinkName = req.query.drinkName;
  try {
    const drink = await getDrinkByName(drinkName);
    if (!drink) {
      return res.status(404).json({ error: 'Drink not found' });
    }
    const ingredients = await getDrinksIngredients(drink.id);
    const recipe = await getDrinksRecipe(drink.id);
    const image = await getDrinksImg(drink.id);

    const drinkInfo = {
      name: drink.name,
      ingredients,
      recipe,
      image
    };

    res.json({ response: drinkInfo });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

/**
 * Endpoint GET /getAvailableDrinks - Pobiera listę dostępnych drinków.
 */
router.get('/getAvailableDrinks', async (req, res) => {
  try {
    const drinkNames = await getDrinkNames();
    res.json({ response: drinkNames });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

/**
 * Endpoint POST /updateHistory - Aktualizuje historię konwersacji z drinkami.
 */
router.post('/updateHistory', async (req, res) => {
  const { drink } = req.body;

  let sessionId = req.headers['token'];

  if (!sessionId || !drink) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  if (!conversations[sessionId]) {
    conversations[sessionId] = [];
  }

  /**
   * Kiedy użytkownik kilka guzik z nazwą drinka, to żadanie
   * jest również przekonwertowane na wiadomość od użtkownika
   * w takiej postaci:
   */
  const userMessage = {
    role: 'user',
    content: `I want to know more about ${drink.name}`
  }

  /**
   * Kiedy użytkownik kilka guzik z nazwą drinka, to odpowiedź na żądanie
   * jest również przekonwertowane na wiadomość od asystenta
   * w takiej postaci:
   */
  const assistantMessage = {
    role: 'assistant',
    content: `Here's the information for the drink ${drink.name}: Ingredients - ${drink.ingredients.join(', ')}. Recipe - ${drink.recipe}.`,
  };

  conversations[sessionId].push(userMessage);
  conversations[sessionId].push(assistantMessage);

  res.json({ success: true, history: conversations[sessionId] });
});


/**
 * Endpoint POST /chat - Przetwarza wiadomości czatu i odpowiada na pytania użytkowników o drinki.
 *
 * - Sprawdza, czy wiadomość użytkownika zawiera nazwę drinka. Jeśli tak, pobiera szczegóły drinka z bazy danych
 *   i dołącza je do wiadomości użytkownika.
 * - Sprawdza, czy w nagłówkach żądania znajduje się token sesji. Jeśli nie, generuje nowy token sesji i ustawia go
 *   w nagłówkach odpowiedzi.
 * - Pobiera historię konwersacji dla sesji użytkownika lub tworzy nową historię, jeśli jeszcze nie istnieje.
 * - Jeśli historia konwersacji nie zawiera kontekstu systemowego, pobiera dostępne drinki z bazy danych, formatuje prompt
 *   z danymi drinków i wiadomością użytkownika, a następnie dodaje go do historii konwersacji jako wiadomość systemową.
 * - Dodaje wiadomość użytkownika do historii konwersacji.
 * - Wysyła zapytanie do modelu AI (ollama.chat) z historią konwersacji i odbiera odpowiedź.
 * - Modyfikuje odpowiedź za pomocą funkcji modifyResponse, która parsuje JSON z odpowiedzi modelu AI.
 * - Jeśli odpowiedź zawiera dane drinka, pobiera dodatkowe szczegóły drinka z bazy danych, takie jak obraz, przepis
 *   i składniki, a następnie tworzy obiekt JSON z pełnymi informacjami o drinku.
 * - Dodaje odpowiedź asystenta do historii konwersacji i aktualizuje historię sesji.
 * - Zwraca sformatowaną odpowiedź do klienta.
 *
 * @param {Object} req - Obiekt żądania HTTP.
 * @param {Object} res - Obiekt odpowiedzi HTTP.
 */
router.post('/chat', async (req, res) => {
  let userMessage = req.body.message;
  const drinkName = req.body.drink;

  // Jeśli nazwa drinka jest określona, dodaj szczegóły drinka do wiadomości użytkownika
  if (drinkName !== undefined && drinkName !== "") {
    const drink = await getDrinkByName(drinkName);
    console.log(drink);
    userMessage = `Tell me more about the drink named ${drinkName}. Here are the details: ${JSON.stringify(drink)}`;
  }

  let sessionId = req.headers['token'];
  if (!sessionId) {
    sessionId = randomUUID();
    res.setHeader('token', sessionId);
  }

  const ollama = new Ollama();

  let conversationHistory = conversations[sessionId] || [];

  // Dodaj kontekst systemowy, jeśli nie istnieje w historii konwersacji
  const contextExists = conversationHistory.some(msg => msg.role === 'system');
  if (!contextExists) {
    const availableDrinks = await getDrinks();
    const formattedPrompt = formatPrompt(availableDrinks, userMessage);
    conversationHistory.unshift({ role: 'system', content: formattedPrompt });
  }

  // Dodaj wiadomość użytkownika do historii konwersacji
  conversationHistory.push({ role: 'user', content: userMessage });

  console.log(`Session ID: ${sessionId}`);
  console.log('Request Headers:', req.headers);
  console.log('Request Body:', req.body);
  console.log('Conversation History:', conversationHistory);

  try {
    // Wysyła zapytanie do modelu AI z historią konwersacji
    const response = await ollama.chat({
      model: 'gemma:2b',
      messages: conversationHistory,
    });

    console.log(ollama);
    console.log(`Received response: ${response.message.content}`);

    const modifiedResponse = modifyResponse(response.message.content);

    let jsonResp = null;
    if (modifiedResponse.json !== null) {
      // Pobiera dodatkowe szczegóły drinka, jeśli odpowiedź zawiera dane drinka
      let imagePath = await getDrinksImg(modifiedResponse.json.id);
      let recipe = await getDrinksRecipe(modifiedResponse.json.id);
      let ingredients = await getDrinksIngredients(modifiedResponse.json.id);

      jsonResp = {
        name: modifiedResponse.json.name,
        ingredients: ingredients,
        recipe: recipe,
        image: imagePath
      };
    }

    const formattedResponse = {
      msg: modifiedResponse.msg,
      json: jsonResp
    };

    // Dodaje odpowiedź asystenta do historii konwersacji i aktualizuje historię sesji
    conversationHistory.push({ role: 'assistant', content: response.message.content });
    conversations[sessionId] = conversationHistory;

    console.log('Updated Conversation History:', conversationHistory);

    // Zwraca sformatowaną odpowiedź do klienta
    res.json({ response: formattedResponse });

  } catch (error) {
    console.error('Ollama error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: "world" });
});

module.exports = router;
