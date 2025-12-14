// Arquivo: game.js (VERSÃO FINAL CORRIGIDA - Anti-travamento)

document.addEventListener('DOMContentLoaded', () => {
    const output = document.getElementById('output');
    const input = document.getElementById('input');
    let estadoJogo = {
        casoAtual: null,
        cenaAtual: 0,
        processando: false
    };

    // --- FUNÇÕES PRINCIPAIS ---

    function appendHtml(htmlString) {
        const div = document.createElement('div');
        // Usar innerHTML em um elemento temporário é mais seguro
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
                // Usar innerHTML aqui é o que estava causando o problema de encoding.
                // Vamos usar textContent para segurança.
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

    // ESTA É A FUNÇÃO CORRIGIDA QUE NÃO TRAVA O JOGO
    function finalizarProcessamentoCena() {
        estadoJogo.cenaAtual++;
        appendHtml("\nPressione ENTER para continuar...\n");
        estadoJogo.processando = false;
    }

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
    }
    
    function exibirMenu() {
        output.innerHTML = '';
        let menuText = `\n===== TERMINAL DE ARQUIVOS 'SOMBRAS DA HISTÓRIA' =====\n`;
        menuText += "Bem-vindo, Arquivista.\n";
        menuText += "Use o comando 'abrir [nome_do_caso]' para começar.\n";
        menuText += "Exemplo: abrir caso-piloto\n";
        type(menuText); // Usamos type aqui para o efeito no menu
    }

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            handleInput();
        }
    });

    exibirMenu();
});
