// Arquivo: game.js (VERSÃO FINAL COM TELA DE ABERTURA REATIVADA)

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DO HTML ---
    const bootScreen = document.getElementById('boot-screen');
    const bootText = document.getElementById('boot-text');
    const terminal = document.getElementById('terminal');
    const output = document.getElementById('output');
    const input = document.getElementById('input');
    const typingSound = document.getElementById('typing-sound');

    // --- ESTADO DO JOGO ---
    let estadoJogo = {
        casoAtual: null,
        cenaAtual: 0,
        processando: false
    };

    // --- LÓGICA DA TELA DE ABERTURA ---
    const bootSequenceText = `>>> ACESSO RESTRITO: TERMINAL 'SOMBRAS' <<<\n>>> CARREGANDO PROTOCOLO DE INVESTIGAÇÃO...\n--------------------------------------------------\nOS ARQUIVOS FORAM ABERTOS.\nO QUE FOI VISTO NÃO PODE SER 'DESVISTO'.\n\nDESVENDE ESTE MISTÉRIO.`;

    function runBootSequence() {
        let i = 0;
        // Tenta tocar o som, mas não impede a execução se o navegador bloquear
        typingSound.play().catch(() => console.log("Autoplay de áudio bloqueado. O usuário precisa interagir com a página primeiro."));

        function bootTyping() {
            if (i < bootSequenceText.length) {
                bootText.textContent += bootSequenceText.charAt(i);
                i++;
                setTimeout(bootTyping, 50);
            } else {
                typingSound.pause();
                setTimeout(showTerminal, 2000); // Espera 2s antes de mostrar o terminal
            }
        }
        bootTyping();
    }

    function showTerminal() {
        bootScreen.classList.add('hidden');
        terminal.classList.remove('hidden');
        input.focus();
        exibirMenu();
    }

    // --- FUNÇÕES PRINCIPAIS DO JOGO ---

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

    function handleInput() {
        const command = input.value.trim().toLowerCase();
        appendHtml(`<span class="comando-usuario">&gt; ${input.value}</span>\n`);
        input.value = '';

        if (command.startsWith('abrir ')) {
            const nomeCaso = command.split(' ')[1];
            if (nomeCaso) {
                carregarCaso(nomeCaso);
            } else {
                appendHtml("Comando 'abrir' incompleto. Especifique o nome do caso.\n");
            }
        } else if (estadoJogo.casoAtual && !estadoJogo.processando) {
            processarCena();
        } else {
            exibirMenu();
        }
    }

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            handleInput();
        }
    });

    // --- INÍCIO DO PROCESSO ---
    runBootSequence();
});
