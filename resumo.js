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
  const filtroData = document.getElementById("filtro-data-resumo");

  // Data atual correta (Brasil)
  filtroData.value = dataLocalISO();

  filtroData.addEventListener("change", gerarResumo);
  document
    .getElementById("filtro-nome-resumo")
    .addEventListener("input", gerarResumo);

  gerarResumo();
});


// ============================
// GERAR RESUMO
// ============================

async function gerarResumo() {
  const dataFiltroISO = document.getElementById("filtro-data-resumo").value;
  const nomeFiltro = document
    .getElementById("filtro-nome-resumo")
    .value.toLowerCase();

  try {
    const response = await fetch(urlAPI + "?t=" + Date.now());
    if (!response.ok) throw new Error("Erro ao buscar dados");

    const dados = await response.json();
    const contagem = {};

    dados.forEach(item => {
      const dataItemISO = dataLocalISO(new Date(item.Data));
      const nome = item.Nome?.toLowerCase() || "";

      if (dataItemISO === dataFiltroISO && nome.includes(nomeFiltro)) {
        const embarcador = item.Embarcador || "Não informado";
        contagem[embarcador] = (contagem[embarcador] || 0) + 1;
      }
    });

    const divTabela = document.getElementById("resumo-tabela");

    const linhas = Object.entries(contagem)
      .map(
        ([emb, total]) =>
          `<tr><td>${emb}</td><td>${total}</td></tr>`
      )
      .join("");

    divTabela.innerHTML =
      linhas ||
      `<tr><td colspan="2">⚠️ Nenhum dado encontrado.</td></tr>`;
  } catch (error) {
    console.error("Erro ao gerar resumo:", error);
    document.getElementById("resumo-tabela").innerHTML = `
      <tr>
        <td colspan="2" style="color:red;">
          ❌ Erro ao carregar resumo.
        </td>
      </tr>`;
  }
}
