// --- CONFIGURAÇÕES ---
const API_URL = 'http://localhost:3000/veiculos';

// Elementos do HTML
const form = document.getElementById('formVeiculo');
const corpoTabela = document.getElementById('corpoTabela');
const btnSalvar = document.getElementById('btnSalvar');
const campoBusca = document.getElementById('campoBusca');

// VARIÁVEL GLOBAL (Armazena a lista completa para a pesquisa funcionar)
let todosVeiculos = []; 

// --- 1. CARREGAR VEÍCULOS (READ) ---
async function carregarVeiculos() {
    try {
        const res = await fetch(API_URL);
        todosVeiculos = await res.json(); // Salva na memória global
        
        // Aplica o filtro se tiver algo escrito, senão mostra tudo
        const termoBusca = campoBusca ? campoBusca.value : "";
        filtrarTabela(termoBusca);

        // Atualiza os cartões coloridos do topo
        atualizarDashboard(todosVeiculos);
        
    } catch (erro) {
        console.error("Erro ao buscar:", erro);
    }
}

// --- 2. SALVAR (CRIAR OU ATUALIZAR) ---
form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Impede a página de recarregar

    const id = document.getElementById('veiculoId').value;
    const marca = document.getElementById('marca').value;
    const modelo = document.getElementById('modelo').value;
    const preco = parseFloat(document.getElementById('preco').value);

    // Validação Simples
    if(!marca || !modelo || !preco) {
        alert("Preencha todos os campos!");
        return;
    }

    const dados = { marca, modelo, preco, ano: 2024, placa: "ABC-0000" };

    try {
        let resposta;
        if (id) {
            // EDITAR (PUT)
            resposta = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
        } else {
            // CRIAR NOVO (POST)
            resposta = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
        }

        if (resposta.ok) {
            limparFormulario();
            await carregarVeiculos(); // Recarrega a lista do banco
        } else {
            const erro = await resposta.json();
            alert("Erro ao salvar: " + (erro.erro || JSON.stringify(erro)));
        }

    } catch (erro) {
        console.error("Erro na requisição:", erro);
    }
});

// --- 3. EXCLUIR ---
window.excluir = async (id) => {
    if(confirm("Deseja realmente excluir este veículo?")) {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            await carregarVeiculos(); // Recarrega a lista
        } catch (erro) {
            console.error("Erro ao excluir:", erro);
        }
    }
}

// --- 4. PREPARAR EDIÇÃO ---
window.prepararEdicao = (id) => {
    // Busca na memória o carro clicado
    const v = todosVeiculos.find(veiculo => veiculo._id === id);
    if (v) {
        document.getElementById('veiculoId').value = v._id;
        document.getElementById('marca').value = v.marca;
        document.getElementById('modelo').value = v.modelo;
        document.getElementById('preco').value = v.preco;
        
        btnSalvar.innerText = "Atualizar";
        
        // Rola a tela para cima (opcional, bom para celular)
        document.getElementById('formVeiculo').scrollIntoView({ behavior: 'smooth' });
    }
}

// --- 5. LÓGICA DE PESQUISA ---
if (campoBusca) {
    campoBusca.addEventListener('input', (e) => {
        filtrarTabela(e.target.value);
    });
}

function filtrarTabela(texto) {
    const textoMinusculo = texto.toLowerCase();
    
    // Filtra a lista global
    const listaFiltrada = todosVeiculos.filter(v => {
        return v.marca.toLowerCase().includes(textoMinusculo) || 
               v.modelo.toLowerCase().includes(textoMinusculo);
    });

    renderizarTabela(listaFiltrada);
}

// --- 6. RENDERIZAR NA TELA ---
function renderizarTabela(lista) {
    corpoTabela.innerHTML = '';
    
    lista.forEach(v => {
        // Formata o dinheiro (R$)
        const precoFormatado = Number(v.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        
        corpoTabela.innerHTML += `
            <tr>
                <td>${v.marca}</td>
                <td>${v.modelo}</td>
                <td>${precoFormatado}</td>
                <td>
                    <button onclick="prepararEdicao('${v._id}')" class="btn-editar">Editar</button>
                    <button onclick="excluir('${v._id}')" class="btn-excluir">Excluir</button>
                </td>
            </tr>
        `;
    });
}

// --- 7. DASHBOARD (Cards do Topo) ---
function atualizarDashboard(lista) {
    // Total de carros
    const total = lista.length;
    
    // Valor total somado
    const valor = lista.reduce((acc, v) => acc + Number(v.preco), 0);

    const elTotal = document.getElementById('totalCarros');
    const elValor = document.getElementById('valorTotal');

    if(elTotal) elTotal.innerText = total;
    if(elValor) elValor.innerText = valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// --- UTILITÁRIOS ---
function limparFormulario() {
    form.reset();
    document.getElementById('veiculoId').value = '';
    btnSalvar.innerText = "Salvar Veículo";
}

// INICIALIZAÇÃO
carregarVeiculos();