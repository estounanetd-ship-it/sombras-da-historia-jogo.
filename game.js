// Arquivo: game.js (VERSÃO FINAL - "DETETIVE DE IMAGENS")

document.addEventListener('DOMContentLoaded', () => {
    const output = document.getElementById('output');
    const input = document.getElementById('input');
    let estadoJogo = {
        casoAtual: null,
        cenaAtual: 0,
        processando: false // Trava para evitar múltiplos Enters
    };

    // --- FUNÇÕES PRINCIPAIS ---

    // Função para adicionar HTML ao output de forma segura
    function appendHtml(htmlString) {
        const div = document.createElement('div');
        div.innerHTML = htmlString.trim();
        while (div.firstChild) {
            output.appendChild(div.firstChild);
        }
    }

    // Função para imprimir texto no terminal com efeito de digitação
    function type(text, onComplete) {
        const speed = 15;
        let i = 0;

        function typing() {
            if (i < text.length) {
                output.innerHTML += text.charAt(i);
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
        if (estadoJogo.processando) return;
        estadoJogo.processando = true;
        try {
            const response = await fetch(`casos/${nomeCaso}.json`);
            if (!response.ok) throw new Error(`Arquivo do caso "${nomeCaso}.json" não encontrado.`);
            const casoData = await response.json();
            
            estadoJogo.casoAtual = casoData;
            estadoJogo.cenaAtual = 0;
            
            output.innerHTML = ''; // Limpa o terminal
            type(`Carregando arquivo: ${casoData.titulo}...\n\n`, () => {
                estadoJogo.processando = false;
                processarCena();
            });
        } catch (error) {
            appendHtml(`<p style="color: red;">\nErro: ${error.message}\n</p>`);
            estadoJogo.processando = false;
        }
    }

    // Função para processar a cena atual do caso
    function processarCena() {
        if (estadoJogo.processando || !estadoJogo.casoAtual) return;
        
        if (estadoJogo.cenaAtual >= estadoJogo.casoAtual.arquivos.length) {
            type("\nFim do arquivo de caso. Digite 'menu' para voltar.\n");
            estadoJogo.casoAtual = null;
            return;
        }
        
        estadoJogo.processando = true;
        const cena = estadoJogo.casoAtual.arquivos[estadoJogo.cenaAtual];
        let htmlToAdd = '';

        switch (cena.tipo) {
            case 'transcricao':
                htmlToAdd = `\n[Transcrição: ${cena.nome}]\n${cena.conteudo}\n`;
                type(htmlToAdd, () => {
                    finalizarProcessamentoCena();
                });
                return; // Retorna para não executar o appendHtml abaixo
            
            case 'imagem':
                // Remove a extensão do arquivo para testar ambas
                const nomeBaseImagem = cena.nome.split('.')[0];
                htmlToAdd = `\n[Visualizando Imagem: ${cena.nome}]\n<img src="imagens/${nomeBaseImagem}.png" onerror="this.onerror=null;this.src='imagens/${nomeBaseImagem}.jpg';" alt="${cena.descricao}" class="imagem-container">\n<p>${cena.descricao}</p>\n`;
                break;

            case 'audio':
                htmlToAdd = `\n[Reproduzindo Áudio: ${cena.nome}]\n<audio controls src="audios/${cena.nome}" class="audio-container"></audio>\n<p>${cena.descricao}</p>\n`;
                break;
        }
        
        appendHtml(htmlToAdd);
        finalizarProcessamentoCena();
    }

    function finalizarProcessamentoCena() {
        estadoJogo.cenaAtual++;
        type("\nPressione ENTER para continuar...\n", () => {
            estadoJogo.processando = false; // Libera para o próximo Enter
        });
    }

    // Função para lidar com o input do usuário
    function handleInput() {
        const command = input.value.trim().toLowerCase();
        appendHtml(`<span class="comando-usuario">&gt; ${input.value}</span>\n`);
        input.value = '';

        if (estadoJogo.casoAtual && !estadoJogo.processando) {
            processarCena();
        } else if (!estadoJogo.casoAtual) {
            if (command.startsWith('abrir ')) {
                const nomeCaso = command.split(' ')[1];
                if (nomeCaso) carregarCaso(nomeCaso);
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

    exibirMenu();
});
