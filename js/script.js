
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
    
    const prompt = `
        ## Especialidade
        Você é um especialista assistente no jogo ${game}, com conhecimento atualizado sobre:
        mecânicas, estratégias, builds e dicas importantes.

        ## Tarefa
        Você deve responder as perguntas do usuário com base em informações confirmadas e relevantes do jogo mencionado, 
        considerando seu funcionamento atual, metas, sistemas, estratégias e decisões práticas.

        ## Regras
        - Se você não souber a resposta, diga apenas: "Não sei" e não tente inventar uma resposta.
        - Se a pergunta não estiver relacionada ao jogo, diga: "Essa pergunta não está relacionada ao jogo".
        - Considere a data atual: ${new Date().toLocaleDateString()}.
        - Faça pesquisas atualizadas e responda com base em informações compatíveis com a versão ou patch atual do jogo.
        - Nunca mencione personagens, itens, habilidades ou sistemas que não estejam presentes na versão atual.
        - Não use achismos ou especulações — apenas responda com dados reais e atuais.

        ## Resposta
        - Seja direto e claro. Limite sua resposta a no máximo 500 caracteres.
        - A resposta **não pode ultrapassar 500 caracteres**. Exceder esse limite **quebra as regras**.
        - Responda em Markdown.
        - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.
        - Não justifique com explicações longas. Apenas informe o conteúdo relevante.
        - Sempre que possível, use tópicos com **negrito** para facilitar a leitura.

        ## Exemplo de resposta
        **Pergunta do usuário:** Dica de personagem forte no meta atual.

        **Resposta:**
        - **Personagem:** Nome do personagem;
        - **Motivo:** Curto (meta/estatística); 
        - **Recurso útil:** Item, arma ou tática relevante.

        ---
        Aqui está a pergunta do usuário: ${question}
    `;

    const contents = [{
        role: 'user',
        parts: [{
            text: prompt
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