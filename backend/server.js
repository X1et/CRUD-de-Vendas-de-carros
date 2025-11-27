const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// --- CONFIGURAÇÕES DE SEGURANÇA E ACESSO ---
app.use(helmet()); // Protege os cabeçalhos HTTP
app.use(cors());   // Permite que o seu Frontend acesse o Backend
app.use(express.json()); // Permite ler os dados JSON enviados pelo formulário

// --- CONEXÃO COM O MONGODB ---
// Certifique-se de que o MongoDB Compass está instalado e rodando
mongoose.connect('mongodb://127.0.0.1:27017/loja_veiculos')
    .then(() => console.log('✅ Backend conectado ao Banco de Dados!'))
    .catch(err => console.error('❌ Erro ao conectar no MongoDB:', err));

// --- MODELO DO VEÍCULO (REGRAS DO BANCO) ---
const VeiculoSchema = new mongoose.Schema({
    marca: { 
        type: String, 
        required: true,
        trim: true 
    },
    modelo: { 
        type: String, 
        required: true,
        trim: true 
    },
    ano: Number,
    placa: String,
    preco: { 
        type: Number, 
        required: true,
        min: [0, "O preço não pode ser negativo"] // Validação de segurança
    },
    dataCadastro: { type: Date, default: Date.now }
});

const Veiculo = mongoose.model('Veiculo', VeiculoSchema);

// --- ROTAS DA API (O GARÇOM DO SISTEMA) ---

// 1. LISTAR (GET) - Traz todos os carros
app.get('/veiculos', async (req, res) => {
    try {
        // Ordena pelos mais novos primeiro (-1)
        const veiculos = await Veiculo.find().sort({ dataCadastro: -1 });
        res.json(veiculos);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao buscar veículos" });
    }
});

// 2. CADASTRAR (POST) - Salva um novo carro
app.post('/veiculos', async (req, res) => {
    try {
        const novoVeiculo = new Veiculo(req.body);
        await novoVeiculo.save();
        res.status(201).json(novoVeiculo);
    } catch (error) {
        res.status(400).json({ erro: error.message });
    }
});

// 3. ATUALIZAR (PUT) - Edita um carro existente
app.put('/veiculos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const veiculo = await Veiculo.findByIdAndUpdate(id, req.body, { new: true });
        res.json(veiculo);
    } catch (error) {
        res.status(400).json({ erro: "Erro ao atualizar. Verifique os dados." });
    }
});

// 4. EXCLUIR (DELETE) - Apaga do banco
app.delete('/veiculos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Veiculo.findByIdAndDelete(id);
        res.json({ mensagem: "Veículo excluído com sucesso" });
    } catch (error) {
        res.status(500).json({ erro: "Erro ao excluir veículo" });
    }
});

// --- LIGAR O SERVIDOR ---
app.listen(3000, () => {
    console.log('🚀 Servidor rodando na porta 3000');
});