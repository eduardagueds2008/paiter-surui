
function abrirBancoMidias() {
    return new Promise(function(resolve, reject) {
        const requisicao = indexedDB.open(
            "PaiterSuruiMidias",
            1
        );

        requisicao.onupgradeneeded = function(evento) {
            const banco = evento.target.result;

            if (!banco.objectStoreNames.contains("midias")) {
                const armazenamento = banco.createObjectStore(
                    "midias",
                    { keyPath: "id", autoIncrement: true }
                );

                armazenamento.createIndex(
                    "licaoId",
                    "licaoId",
                    { unique: false }
                );
            }
        };

        requisicao.onsuccess = function() {
            resolve(requisicao.result);
        };

        requisicao.onerror = function() {
            reject(requisicao.error);
        };
    });
}

async function salvarMidiaLicao(licaoId, arquivo) {
    const banco = await abrirBancoMidias();

    return new Promise(function(resolve, reject) {
        const transacao = banco.transaction(
            ["midias"],
            "readwrite"
        );

        const armazenamento = transacao.objectStore("midias");

        const registro = {
            licaoId: licaoId,
            nome: arquivo.name,
            tipo: arquivo.type,
            arquivo: arquivo,
            dataCadastro: new Date().toISOString()
        };

        const requisicao = armazenamento.add(registro);

        requisicao.onsuccess = function() {
            resolve(requisicao.result);
        };

        requisicao.onerror = function() {
            reject(requisicao.error);
        };

        transacao.oncomplete = function() {
            banco.close();
        };

        transacao.onerror = function() {
            banco.close();
        };
    });
}

async function buscarMidiasDaLicao(licaoId) {
    const banco = await abrirBancoMidias();

    return new Promise(function(resolve, reject) {
        const transacao = banco.transaction(
            ["midias"],
            "readonly"
        );

        const armazenamento = transacao.objectStore("midias");
        const indice = armazenamento.index("licaoId");

        const requisicao = indice.getAll(licaoId);

        requisicao.onsuccess = function() {
            resolve(requisicao.result);
        };

        requisicao.onerror = function() {
            reject(requisicao.error);
        };

        transacao.oncomplete = function() {
            banco.close();
        };

        transacao.onerror = function() {
            banco.close();
        };
    });
}

async function listarTodasMidias() {
    const banco = await abrirBancoMidias();

    return new Promise(function(resolve, reject) {
        const transacao = banco.transaction(
            ["midias"],
            "readonly"
        );

        const armazenamento =
            transacao.objectStore("midias");

        const requisicao = armazenamento.getAll();

        requisicao.onsuccess = function() {
            resolve(requisicao.result);
        };

        requisicao.onerror = function() {
            reject(requisicao.error);
        };

        transacao.oncomplete = function() {
            banco.close();
        };

        transacao.onerror = function() {
            banco.close();
        };
    });
}

async function excluirMidiaPorId(idMidia) {
    const banco = await abrirBancoMidias();

    return new Promise(function(resolve, reject) {
        const transacao = banco.transaction(
            ["midias"],
            "readwrite"
        );

        const armazenamento =
            transacao.objectStore("midias");

        armazenamento.delete(idMidia);

        transacao.oncomplete = function() {
            banco.close();
            resolve();
        };

        transacao.onerror = function() {
            const erro = transacao.error;
            banco.close();
            reject(erro);
        };

        transacao.onabort = function() {
            const erro = transacao.error;
            banco.close();
            reject(erro);
        };
    });
}

async function substituirMidiaPorId(idMidia, novoArquivo) {
    const banco = await abrirBancoMidias();

    return new Promise(function(resolve, reject) {
        const transacao = banco.transaction(
            ["midias"],
            "readwrite"
        );

        const armazenamento =
            transacao.objectStore("midias");

        let registroAtualizado = null;

        const consulta = armazenamento.get(idMidia);

        consulta.onsuccess = function() {
            const registroAntigo = consulta.result;

            if (!registroAntigo) {
                transacao.abort();
                return;
            }

            registroAtualizado = {
                ...registroAntigo,
                nome: novoArquivo.name,
                tipo: novoArquivo.type,
                arquivo: novoArquivo,
                dataAtualizacao: new Date().toISOString()
            };

            armazenamento.put(registroAtualizado);
        };

        transacao.oncomplete = function() {
            banco.close();
            resolve(registroAtualizado);
        };

        transacao.onerror = function() {
            const erro = transacao.error;
            banco.close();
            reject(erro);
        };

        transacao.onabort = function() {
            const erro = transacao.error;
            banco.close();
            reject(
                erro || new Error("Substituição cancelada.")
            );
        };
    });
}
