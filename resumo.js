const urlAPI = "https://script.google.com/macros/s/AKfycbzswkZb7WBo5zJIi2dwATjz5kNvw6Qx2QlNJzLj2xa8-hQTQ50iMeWZvvx7u55Zq3P5/exec";

document.addEventListener("DOMContentLoaded", () => {
  const filtroData = document.getElementById("filtro-data-resumo");
  const filtroNome = document.getElementById("filtro-nome-resumo");
  const recarregarBtn = document.getElementById("recarregar-pagina");

  const hojeISO = new Date().toISOString().split("T")[0];
  filtroData.value = hojeISO;

  filtroData.addEventListener("change", gerarResumo);
  filtroNome.addEventListener("input", gerarResumo);
  recarregarBtn.addEventListener("click", gerarResumo);

  gerarResumo();
});

async function gerarResumo() {
  const tabelaDiv = document.getElementById("resumo-tabela");
  const filtroDataInput = document.getElementById("filtro-data-resumo").value;
  const nomeFiltro = document.getElementById("filtro-nome-resumo").value.toLowerCase();

  tabelaDiv.innerHTML = `<p style="text-align:center;">🔄 Carregando...</p>`;

  try {
    const response = await fetch(urlAPI);
    if (!response.ok) throw new Error("Falha ao buscar dados");
    const dados = await response.json();

    const partes = filtroDataInput.split("-");
    const dataFiltro = `${partes[2]}/${partes[1]}/${partes[0]}`;
    const contagem = {};

    dados.forEach(item => {
      const dataItem = formatarData(item.Data);
      const nome = item.Nome?.toLowerCase() || "";
      if (dataItem === dataFiltro && nome.includes(nomeFiltro)) {
        const embarcador = item.Embarcador || "Não informado";
        contagem[embarcador] = (contagem[embarcador] || 0) + 1;
      }
    });

    const linhas = Object.entries(contagem)
      .map(([emb, total]) => `<tr><td>${emb}</td><td>${total}</td></tr>`)
      .join("");

    tabelaDiv.innerHTML = `
      <table>
        <thead><tr><th>Embarcador</th><th>Cadastros</th></tr></thead>
        <tbody>${linhas || "<tr><td colspan='2'>⚠️ Nenhum dado encontrado.</td></tr>"}</tbody>
      </table>
    `;

    gerarGrafico(contagem);
  } catch (error) {
    console.error("Erro ao gerar resumo:", error);
    tabelaDiv.innerHTML = `<p style="color:red;text-align:center;">❌ Erro ao carregar dados da API.</p>`;
  }
}

function gerarGrafico(contagem) {
  const ctx = document.getElementById("graficoResumo").getContext("2d");
  if (window.graficoBarra) window.graficoBarra.destroy();

  window.graficoBarra = new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(contagem),
      datasets: [
        {
          label: "Cadastros por embarcador",
          data: Object.values(contagem),
          backgroundColor: "#007b5e"
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        x: { ticks: { color: "#333" } },
        y: { beginAtZero: true, ticks: { precision: 0 } }
      },
      plugins: { legend: { display: false } }
    }
  });
}

// Conversão de datas segura (suporta BR e ISO)
function formatarData(dataStr) {
  if (!dataStr) return "";
  if (dataStr.includes("/")) return dataStr; // já no formato DD/MM/YYYY
  const data = new Date(dataStr);
  if (isNaN(data)) return "";
  return `${data.getDate().toString().padStart(2, "0")}/${(data.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${data.getFullYear()}`;
}
