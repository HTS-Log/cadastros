const urlAPI = "https://script.google.com/macros/s/AKfycbzswkZb7WBo5zJIi2dwATjz5kNvw6Qx2QlNJzLj2xa8-hQTQ50iMeWZvvx7u55Zq3P5/exec";


// ============================
// FUNÇÕES DE DATA (À PROVA DE 2026)
// ============================

// Retorna yyyy-mm-dd no fuso do Brasil
function dataLocalISO(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

// Retorna dd/mm/yyyy no fuso do Brasil
function formatarData(dataStr) {
  if (!dataStr) return "";

  // Se já vier formatado do GAS
  if (dataStr.includes("/")) return dataStr;

  const data = new Date(dataStr);
  if (isNaN(data)) return "";

  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo"
  }).format(data);
}


// ============================
// DOM READY
// ============================

document.addEventListener("DOMContentLoaded", () => {
  const filtroNome = document.getElementById("filtro-nome");
  const filtroData = document.getElementById("filtro-data");
  const recarregarBtn = document.getElementById("recarregar-pagina");
  const toggle = document.getElementById("toggle-theme");

  // Define data atual (Brasil, não UTC)
  filtroData.value = dataLocalISO();

  atualizarTextoTema();
  carregarDados();

  filtroNome.addEventListener("input", carregarDados);
  filtroData.addEventListener("change", carregarDados);
  recarregarBtn.addEventListener("click", carregarDados);

  toggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    atualizarTextoTema();
  });

  // Atualização automática (60s)
  setInterval(() => {
    console.log("Atualização automática");
    carregarDados();
  }, 500000);
});


// ============================
// UI
// ============================

function atualizarTextoTema() {
  const toggle = document.getElementById("toggle-theme");
  const escuro = document.body.classList.contains("dark-mode");
  toggle.textContent = escuro ? "☀️ Modo Claro" : "🌙 Modo Escuro";
}


// ============================
// CARREGAMENTO DE DADOS
// ============================

async function carregarDados() {
  const tabela = document.getElementById("tabela-dados");
  const filtroNome = document.getElementById("filtro-nome").value.toLowerCase();
  const filtroDataInput = document.getElementById("filtro-data").value;

  tabela.innerHTML = `<tr><td colspan="9">🔄 Atualizando...</td></tr>`;

  try {
    const response = await fetch(urlAPI + "?t=" + Date.now()); // evita cache
    if (!response.ok) throw new Error("Falha ao buscar dados");

    const dados = await response.json();

    const linhas = dados
      .filter(item => {
        const dataItemISO = dataLocalISO(new Date(item.Data));
        return (
          dataItemISO === filtroDataInput &&
          item.Nome?.toLowerCase().includes(filtroNome)
        );
      })
      .map(item => {
        const dataItem = formatarData(item.Data);
        const statusClass = item.Status === "Ativo" ? "status-ativo" : "status-inativo";
        const finalizadoClass = item.Finalizado === "Sim" ? "finalizado-sim" : "finalizado-nao";

        return `
          <tr>
            <td>${dataItem}</td>
            <td>${item.Nome || ""}</td>
            <td>${item.Placa || ""}</td>
            <td>${item.Contato || ""}</td>
            <td class="${statusClass}">${item.Status || ""}</td>
            <td class="${finalizadoClass}">${item.Finalizado || "Não"}</td>
            <td>${item.Pix || ""}</td>
            <td>${item.Agente || "Não informado"}</td>
            <td>${item.Embarcador || "Não informado"}</td>
          </tr>`;
      })
      .join("");

    tabela.innerHTML =
      linhas ||
      `<tr><td colspan="9">⚠️ Nenhum dado encontrado para esta data.</td></tr>`;
  } catch (error) {
    console.error("Erro ao carregar os dados:", error);
    tabela.innerHTML = `
      <tr>
        <td colspan="9" style="color:red;">
          ❌ Erro ao carregar dados da API.
        </td>
      </tr>`;
  }
}
