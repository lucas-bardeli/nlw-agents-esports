
const form = document.getElementById('form');
const apiKeyInput = document.getElementById('api-key');
const gameSelect = document.getElementById('game-select');
const questionInput = document.getElementById('question');
const askButton = document.getElementById('ask-button');
const aiResponse = document.getElementById('ai-response');

form.addEventListener('submit', async function(event) {
    event.preventDefault();
    const apiKey = apiKeyInput.value;
    const game = gameSelect.value;
    const question = questionInput.value;

    if ((apiKey == '') || (game == '') || (question == '')) {
        alert('Por favor, preencha todos os campos.');
        return
    }

    askButton.disabled = true;
    askButton.textContent = 'Perguntando...';
    askButton.classList.add('loading');

    try {
        const text = await perguntarIA(question, game, apiKey);
        aiResponse.querySelector('.response-content').innerHTML = text;
    } 
    catch (error) {
        console.log(`Erro: ${error}`);
    }
    finally {
        askButton.disabled = false;
        askButton.textContent = 'Perguntar';
        askButton.classList.remove('loading');
    }
});

const perguntarIA = async function(question, game, apiKey) {
    const model = 'gemini-2.5-flash';
    const baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const pergunta = `
        olha, tenho esse jogo ${game} e queria saber ${question}
    `;

    const contents = [{
        parts: [{
            text: pergunta
        }]
    }];

    // Chamada API
    const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents
        })
    });

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
} 