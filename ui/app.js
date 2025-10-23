// Minimal UI logic with Stacks Connect to call contract functions
// NOTE: You must serve this folder (e.g. with a static server) and connect a Stacks wallet.

const CONTRACT_NAME = "tiktaktok";
// Replace with your real deployer address on testnet if needed; in simnet it will be the deployer.
const DEPLOYER = "SP000000000000000000002Q6VF78"; // placeholder; update as needed
const CONTRACT_ID = `${DEPLOYER}.${CONTRACT_NAME}`;

const boardEl = document.getElementById("board");
const statusEl = document.getElementById("game-status");
const pointsEl = document.getElementById("points");
const tttcEl = document.getElementById("tttc");
const lpEl = document.getElementById("lp");
const connectBtn = document.getElementById("connect");
const whoamiEl = document.getElementById("whoami");
const contractIdEl = document.getElementById("contract-id");
contractIdEl.textContent = CONTRACT_ID;

let currentUser = null;
let board = Array(9).fill(null);
let turn = "X";

function renderBoard(){
  boardEl.innerHTML = "";
  board.forEach((v, i) => {
    const d = document.createElement("button");
    d.className = "cell";
    d.textContent = v ?? "";
    d.onclick = () => move(i);
    boardEl.appendChild(d);
  });
}

function winner(b){
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for(const [a,b2,c] of lines){
    if(b[a] && b[a]===b[b2] && b[a]===b[c]) return b[a];
  }
  if(b.every(Boolean)) return "draw";
  return null;
}

function reset(){
  board = Array(9).fill(null);
  turn = "X";
  statusEl.textContent = "";
  renderBoard();
}

document.getElementById("reset").onclick = reset;

function move(i){
  if(board[i] || winner(board)) return;
  board[i]=turn;
  turn = turn === "X" ? "O" : "X";
  const w = winner(board);
  if(w){
    statusEl.textContent = w === "draw" ? "Draw!" : `${w} wins!`;
    // If there is a logged in user and a winner, call operator to award 1 point to the winner's address.
    // For demo purposes we let the connected user claim a point locally; operator panel can award on-chain.
  }
  renderBoard();
}

renderBoard();

// Wallet connect (placeholder; integrate with @stacks/connect as needed)
connectBtn.onclick = async () => {
  alert("Integrate Stacks wallet connect here. This stub just sets a fake principal.");
  currentUser = prompt("Enter your principal (SP...)") || null;
  whoamiEl.textContent = currentUser ? `Connected: ${currentUser}` : "";
  await refreshBalances();
};

async function refreshBalances(){
  // In a real app, use a Stacks node RPC to call read-only functions.
  // Placeholder: display dashes.
  pointsEl.textContent = "?";
  tttcEl.textContent = "?";
  lpEl.textContent = "?";
}

// Actions (these would call contract functions via Stacks transactions in a real app)
document.getElementById("convert-btn").onclick = () => alert("Submit convert-points transaction via wallet");
document.getElementById("deposit-btn").onclick = () => alert("Submit deposit-tttc transaction via wallet");
document.getElementById("withdraw-btn").onclick = () => alert("Submit withdraw-tttc transaction via wallet");

document.getElementById("op-award").onclick = () => alert("Operator should submit award-points transaction via wallet");