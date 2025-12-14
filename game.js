// Arquivo: game.js (VERSÃO FINAL CORRIGIDA)

document.addEventListener('DOMContentLoaded', () => {
    const output = document.getElementById('output');
    const input = document.getElementById('input');
    let estadoJogo = {
        casoAtual: null,
        cenaAtual: 0,
        esperandoDecisao: null
    };

    // --- FUNÇÕES PRINCIPAIS ---

    // Função para imprimir texto no terminal com efeito de digitação
    function type(text, onComplete) {
        // Se o texto contiver HTML, insira diretamente para evitar quebras.
        if (text.includes('<') && text.includes('>')) {
            output.innerHTML += text;
            if (onComplete) onComplete();
            return;
        }

        const speed = 15;
        const textNode = document.createTextNode('');
        const span = document.createElement('span');
        span.appendChild(textNode);
        output.appendChild(span);

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

    // Função para carregar e iniciar um caso a partir de um arquivo JSON
    async function carregarCaso(nomeCaso) {
        try {
            const response = await fetch(`casos/${nomeCaso}.json`);
            if (!response.ok) throw new Error(`Arquivo do caso "${nomeCaso}" não encontrado.`);
            const casoData = await response.json();
            
            estadoJogo.casoAtual = casoData;
            estadoJogo.cenaAtual = 0;
            estadoJogo.esperandoDecisao = null;
            
            output.innerHTML = ''; // Limpa o terminal
            type(`Carregando arquivo: ${casoData.titulo}...\n\n`, processarCena);
        } catch (error) {
            type(`\nErro: ${error.message}\n`);
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
                // Lembre-se de ajustar o .jpg para .png se necessário no seu JSON
                htmlToAdd = `\n[Visualizando Imagem: ${cena.nome}]\n<img src="imagens/${cena.nome}" alt="${cena.descricao}" class="imagem-container">\n<p>${cena.descricao}</p>\n`;
                break;
            case 'audio':
                htmlToAdd = `\n[Reproduzindo Áudio: ${cena.nome}]\n<audio controls src="audios/${cena.nome}" class="audio-container"></audio>\n<p>${cena.descricao}</p>\n`;
                break;
        }
        
        type(htmlToAdd, () => {
            estadoJogo.cenaAtual++;
            type("\nPressione ENTER para continuar...\n");
        });
    }

    // Função para lidar com o input do usuário
    function handleInput() {
        const command = input.value.trim().toLowerCase();
        output.innerHTML += `<span class="comando-usuario">&gt; ${input.value}</span>\n`;
        input.value = '';

        if (estadoJogo.casoAtual) {
            processarCena(); // Pressionar ENTER continua o caso
        } else {
            // Comandos do menu principal
            if (command.startsWith('abrir ')) {
                const nomeCaso = command.split(' ')[1];
                if (nomeCaso) {
                    carregarCaso(nomeCaso);
                } else {
                    type("\nComando inválido. Especifique um nome de caso. Ex: abrir caso-piloto\n");
                }
            } else if (command === 'menu' || command === 'ajuda') {
                 exibirMenu();
            } else {
                type("\nComando desconhecido. Digite 'ajuda' para ver os comandos.\n");
            }
        }
        output.scrollTop = output.scrollHeight;
    }
    
    // Função para exibir o menu inicial
    function exibirMenu() {
        type("\n===== TERMINAL DE ARQUIVOS 'SOMBRAS DA HISTÓRIA' =====\n");
        type("Bem-vindo, Arquivista.\n");
        type("Use o comando 'abrir [nome_do_caso]' para começar.\n");
        type("Exemplo: abrir caso-piloto\n");
    }

    // --- EVENT LISTENERS ---

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            handleInput();
        }
    });

    // --- INÍCIO DO JOGO ---
    exibirMenu();
});
