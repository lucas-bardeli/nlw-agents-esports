
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
        aiResponse.querySelector('.response-content').innerHTML = markdownToHTML(text);
        aiResponse.classList.remove('hidden');
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

    const perguntaLol = `
        ## Especialidade
        Você é um especialista assistente de meta para o jogo ${game}.

        ## Tarefa
        Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, builds e dicas.

        ## Regras
        - Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta.
        - Se a pergunta não está relacionada ao jogo, responda com 'Essa pergunta não está relacionada ao jogo'.
        - Considere a data atual ${new Date().toLocaleDateString()}.
        - Faça pesquisas atualizadas sobre o patch atual, baseada na data atual, para dar uma resposta coerente.
        - Nunca responda itens que você não tem certeza de que existem no patch atual.

        ## Resposta
        - Economize na resposta, seja direto e responda no máximo com 500 caracteres.
        - Responda em Markdown.
        - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.

        ## Exemplo de resposta
        Pergunta do usuário: Melhor build rengar jungle.
        Resposta: A build mais atual é: \n\n **Itens:** \n\n coloque os itens aqui. \n\n **Runas:** \n\n exemplo de runas. \n\n

        ---
        Aqui está a pergunta do usuário: ${question}
    `;

    let pergunta = perguntaLol;

    const contents = [{
        role: 'user',
        parts: [{
            text: pergunta
        }]
    }];

    const tools = [{
        google_search: {}
    }];

    // Chamada API
    const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents,
            tools
        })
    });

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

const markdownToHTML = function(text) {
    const converter = new showdown.Converter();
    return converter.makeHtml(text);
}