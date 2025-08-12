import express from "express";
import bodyParser from "body-parser";
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(bodyParser.json());

// Provider local (Ganache o Hardhat localhost)
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

// Clave privada de la cuenta propietaria (del Ganache o Hardhat)
// Ponla en .env: PRIVATE_KEY="0x..."
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const contractAddress = "0x8CdaF0CD259887258Bc13a92C0a6dA92698644C0";

const contractABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  "function mint(address to, uint256 amount)",
];
 
// Contratos con provider y signer
const readContract = new ethers.Contract(
  contractAddress,
  contractABI,
  provider
);
const writeContract = new ethers.Contract(contractAddress, contractABI, signer);

// Endpoints
app.get("/info", async (req, res) => {
  try {
    const name = await readContract.name();
    const symbol = await readContract.symbol();
    const decimals = await readContract.decimals();

    res.json({
      name: name.toString(),
      symbol: symbol.toString(),
      decimals: decimals.toString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/balance/:address", async (req, res) => {
  try {
    const balance = await readContract.balanceOf(req.params.address);
    const decimals = await readContract.decimals();
    const balanceFormatted = ethers.formatUnits(balance, decimals);

    res.json({ address: req.params.address, balance: balanceFormatted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/mint", async (req, res) => {
  try {
    const { to, amount } = req.body;
    if (!to || !amount)
      return res.status(400).json({ error: "Faltan parámetros to o amount" });

    const decimals = await readContract.decimals();
    const amountParsed = ethers.parseUnits(amount.toString(), decimals);

    const tx = await writeContract.mint(to, amountParsed);
    await tx.wait();

    res.json({ status: "Tokens minteados", to, amount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}`);
});
