// Arquivo: game.js (VERSÃO FINAL REVISADA E CORRIGIDA)

document.addEventListener('DOMContentLoaded', () => {
    const output = document.getElementById('output');
    const input = document.getElementById('input');
    let estadoJogo = {
        casoAtual: null,
        cenaAtual: 0,
        processando: false
    };

    // --- FUNÇÕES DE RENDERIZAÇÃO ---

    function appendHtml(htmlString) {
        const div = document.createElement('div');
        div.innerHTML = htmlString.trim();
        while (div.firstChild) {
            output.appendChild(div.firstChild);
        }
        output.scrollTop = output.scrollHeight;
    }

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

    // --- LÓGICA PRINCIPAL DO JOGO ---

    async function carregarCaso(nomeCaso) {
        if (estadoJogo.processando) return;
        estadoJogo.processando = true;
        try {
            const response = await fetch(`casos/${nomeCaso}.json`);
            if (!response.ok) throw new Error(`Arquivo do caso "${nomeCaso}.json" não encontrado.`);
            const casoData = await response.json();
            
            estadoJogo.casoAtual = casoData;
            estadoJogo.cenaAtual = 0;
            
            output.innerHTML = '';
            type(`Carregando arquivo: ${casoData.titulo}...\n\n`, () => {
                estadoJogo.processando = false;
                processarCena();
            });
        } catch (error) {
            appendHtml(`<p style="color: red;">\nErro: ${error.message}\n</p>`);
            estadoJogo.processando = false;
        }
    }

    function processarCena() {
        if (estadoJogo.processando || !estadoJogo.casoAtual) return;
        
        if (estadoJogo.cenaAtual >= estadoJogo.casoAtual.arquivos.length) {
            appendHtml("\nFim do arquivo de caso. Digite 'menu' para voltar.\n");
            estadoJogo.casoAtual = null;
            return;
        }
        
        estadoJogo.processando = true;
        const cena = estadoJogo.casoAtual.arquivos[estadoJogo.cenaAtual];
        let htmlToAdd = '';

        switch (cena.tipo) {
            case 'transcricao':
                htmlToAdd = `\n[Transcrição: ${cena.nome}]\n${cena.conteudo}\n`;
                type(htmlToAdd, finalizarProcessamentoCena);
                return;
            
            case 'imagem':
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
        appendHtml("\nPressione ENTER para continuar...\n");
        estadoJogo.processando = false;
    }

    function exibirMenu() {
        output.innerHTML = '';
        let menuText = `\n===== TERMINAL DE ARQUIVOS 'SOMBRAS DA HISTÓRIA' =====\n`;
        menuText += "Bem-vindo, Arquivista.\n";
        menuText += "Use o comando 'abrir [nome_do_caso]' para começar.\n";
        menuText += "Exemplo: abrir caso-piloto\n";
        type(menuText);
    }

    // --- PROCESSADOR DE COMANDOS ---

    function handleInput() {
        const command = input.value.trim().toLowerCase();
        appendHtml(`<span class="comando-usuario">&gt; ${input.value}</span>\n`);
        input.value = '';

        // LÓGICA CORRIGIDA E SIMPLIFICADA
        if (command.startsWith('abrir ')) {
            const nomeCaso = command.split(' ')[1];
            if (nomeCaso) {
                carregarCaso(nomeCaso);
            } else {
                appendHtml("Comando 'abrir' incompleto. Especifique o nome do caso.\n");
            }
        } else if (estadoJogo.casoAtual && !estadoJogo.processando) {
            // Se um caso está ativo, qualquer "Enter" avança a cena
            processarCena();
        } else {
            // Se nenhum caso está ativo e o comando não é 'abrir', mostra o menu
            exibirMenu();
        }
    }

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            handleInput();
        }
    });

    // --- INÍCIO DO JOGO ---
    exibirMenu();
});
