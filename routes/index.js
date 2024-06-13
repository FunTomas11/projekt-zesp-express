const db = require('../db/db');
var express = require('express');
var router = express.Router();

const { randomUUID } = require('crypto');
const { Ollama } = require('ollama');
const { modifyResponse } = require("../public/javascripts/responseModifier");

const conversations = {};

function formatDetails(details) {
  return JSON.stringify(details, (key, value) => {
    if (key == "id") { return undefined; }
    if (key === 'ingredients' && Array.isArray(value)) {
      return value.join(', ');
    }
    if (key === 'recipe' && typeof value === 'string') {
      //return value.replace(/\n/g, ' ');
      return undefined;
    }
    return value;
  });
}

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

function formatSubPrompt(userMessage) {
  return `User input:
${userMessage}

Generate a single drink recommendation. Always format the recommendation as JSON in the following format:
\`\`\`json
{"id":"drinkId","name":"drinkName"}
\`\`\`

Answer:`;
}

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

router.get('/getAvailableDrinks', async (req, res) => {
  try {
    const drinkNames = await getDrinkNames();
    res.json({ response: drinkNames });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

router.post('/updateHistory', async (req, res) => {
  const { drink } = req.body;

  let sessionId = req.headers['token'];

  if (!sessionId || !drink) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  if (!conversations[sessionId]) {
    conversations[sessionId] = [];
  }

  const userMessage = {
    role: 'user',
    content: `I want to know more about ${drink.name}`
  }

  const assistantMessage = {
    role: 'assistant',
    content: `Here's the information for the drink ${drink.name}: Ingredients - ${drink.ingredients.join(', ')}. Recipe - ${drink.recipe}.`,
  };
  
  conversations[sessionId].push(userMessage);
  conversations[sessionId].push(assistantMessage);

  res.json({ success: true, history: conversations[sessionId] });
});

router.post('/chat', async (req, res) => {
  let userMessage = req.body.message;
  const drinkName = req.body.drink;
  if (drinkName !== undefined && drinkName !== "") {
    const drink = await getDrinkByName(drinkName);
    console.log(drink);
    userMessage = `Tell me more about the drink named ${drinkName}. Here are the details: ${JSON.stringify(drink)}`
  }

  let sessionId = req.headers['token'];
  if (!sessionId) {
    sessionId = randomUUID();
    res.setHeader('token', sessionId);
  }

  const ollama = new Ollama();

  let conversationHistory = conversations[sessionId] || [];

  const contextExists = conversationHistory.some(msg => msg.role === 'system');
  if (!contextExists) {
    const availableDrinks = await getDrinks();
    const formattedPrompt = formatPrompt(availableDrinks, userMessage);
    conversationHistory.unshift({ role: 'system', content: formattedPrompt });
  }

  conversationHistory.push({ role: 'user', content: userMessage });

  console.log(`Session ID: ${sessionId}`);
  console.log('Request Headers:', req.headers);
  console.log('Request Body:', req.body);
  console.log('Conversation History:', conversationHistory);

  try {
    const response = await ollama.chat({
	    model: 'gemma:2b',
      messages: conversationHistory,
    });

    console.log(ollama)

    console.log(`Received response: ${response.message.content}`)
    const modifiedResponse = modifyResponse(response.message.content);

    let jsonResp = null;
    if (modifiedResponse.json !== null) {
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
    }

    conversationHistory.push({ role: 'assistant', content: response.message.content });
    conversations[sessionId] = conversationHistory;

    console.log('Updated Conversation History:', conversationHistory);

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
