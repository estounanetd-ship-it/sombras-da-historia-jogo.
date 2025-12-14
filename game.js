// Arquivo: game.js

document.addEventListener('DOMContentLoaded', () => {
    const output = document.getElementById('output');
    const input = document.getElementById('input');
    let estadoJogo = {
        casoAtual: null,
        cenaAtual: 0,
        esperandoDecisao: null
    };

    // Função para imprimir texto no terminal com efeito de digitação (VERSÃO MELHORADA)
function type(text, onComplete) {
    const speed = 15; // Velocidade da digitação
    const textNode = document.createTextNode('');
    output.appendChild(textNode);

    let i = 0;
    function typing() {
        if (i < text.length) {
            output.innerHTML += text.charAt(i); // <<--- A NOVA LINHA CORRIGIDA
            i++;
            output.scrollTop = output.scrollHeight;
            setTimeout(typing, speed);
        } else if (onComplete) {
            onComplete();
        }
    }
    typing();
}

// Função para imprimir texto no terminal com efeito de digitação (VERSÃO MELHORADA)
function type(text, onComplete) {
    const speed = 15; // Velocidade da digitação
    const textNode = document.createTextNode('');
    output.appendChild(textNode);

    let i = 0;
    function typing() {
        if (i < text.length) {
            textNode.nodeValue += text.charAt(i);
            i++;
            output.scrollTop = output.scrollHeight;
            setTimeout(typing, speed);
        } else if (onComplete) {
            onComplete();
        }
    }
    typing();
}


    // Função para carregar e iniciar um caso
    async function carregarCaso(nomeCaso) {
        try {
            const response = await fetch(`casos/${nomeCaso}.json`);
            if (!response.ok) throw new Error(`Arquivo do caso "${nomeCaso}" não encontrado.`);
            const casoData = await response.json();
            estadoJogo.casoAtual = casoData;
            estadoJogo.cenaAtual = 0;
            estadoJogo.esperandoDecisao = null;
            output.innerHTML = ''; // Limpa o terminal
            type(`Carregando arquivo: ${casoData.titulo}...\n\n`, () => {
                processarCena();
            });
        } catch (error) {
            type(`Erro: ${error.message}\n`);
        }
    }

    // Função para processar a cena atual do caso
    function processarCena() {
        if (!estadoJogo.casoAtual || estadoJogo.cenaAtual >= estadoJogo.casoAtual.arquivos.length) {
            type("\nFim do arquivo de caso. Digite 'menu' para voltar.\n");
            estadoJogo.casoAtual = null;
            return;
        }

        const cena = estadoJogo.casoAtual.arquivos[estadoJogo.cenaAtual];
        let htmlToAdd = '';

        switch (cena.tipo) {
            case 'transcricao':
                htmlToAdd = `\n[Transcrição: ${cena.nome}]\n${cena.conteudo}\n`;
                break;
            case 'imagem':
                htmlToAdd = `\n[Visualizando Imagem: ${cena.nome}]\n<img src="imagens/${cena.nome}" alt="${cena.descricao}" class="imagem-container">\n<p>${cena.descricao}</p>\n`;
                break;
            case 'audio':
                htmlToAdd = `\n[Reproduzindo Áudio: ${cena.nome}]\n<audio controls src="audios/${cena.nome}" class="audio-container"></audio>\n<p>${cena.descricao}</p>\n`;
                break;
        }
        
        type(htmlToAdd, () => {
            estadoJogo.cenaAtual++;
            // Verifica se a próxima cena é uma decisão
            const proximaCena = estadoJogo.casoAtual.arquivos[estadoJogo.cenaAtual];
            if (proximaCena && proximaCena.tipo === 'decisao') {
                apresentarDecisao(proximaCena);
            } else {
                type("\nPressione ENTER para continuar...\n");
            }
        });
    }
    
    // Função para apresentar uma decisão ao jogador
    function apresentarDecisao(decisao) {
        estadoJogo.esperandoDecisao = decisao;
        let textoDecisao = `\n[PONTO DE DECISÃO]\n${decisao.pergunta}\n`;
        textoDecisao += `  A) ${decisao.opcao_A}\n`;
        textoDecisao += `  B) ${decisao.opcao_B}\n`;
        type(textoDecisao);
    }

    // Função para lidar com o input do usuário
    function handleInput() {
        const command = input.value.trim().toLowerCase();
        output.innerHTML += `<span class="comando-usuario">&gt; ${input.value}</span>\n`;
        input.value = '';

        if (estadoJogo.esperandoDecisao) {
            if (command === 'a' || command === 'b') {
                const destino = command === 'a' ? estadoJogo.esperandoDecisao.leva_para_A : estadoJogo.esperandoDecisao.leva_para_B;
                estadoJogo.cenaAtual = estadoJogo.casoAtual.arquivos.findIndex(c => c.id_cena === destino);
                estadoJogo.esperandoDecisao = null;
                processarCena();
            } else {
                type("Comando inválido. Escolha 'A' ou 'B'.\n");
            }
        } else if (estadoJogo.casoAtual) {
            processarCena(); // Pressionar ENTER continua
        } else {
            // Comandos do menu principal
            if (command.startsWith('abrir ')) {
                const nomeCaso = command.split(' ')[1];
                carregarCaso(nomeCaso);
            } else {
                exibirMenu();
            }
        }
        output.scrollTop = output.scrollHeight;
    }
    
    function exibirMenu() {
        type("\n===== TERMINAL DE ARQUIVOS 'SOMBRAS DA HISTÓRIA' =====\n");
        type("Bem-vindo, Arquivista.\n");
        type("Use o comando 'abrir [nome_do_caso]' para começar.\n");
        type("Exemplo: abrir caso-piloto\n");
    }

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            handleInput();
        }
    });

    // Inicia o jogo
    exibirMenu();
});

