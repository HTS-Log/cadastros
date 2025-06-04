const urlAPI = "https://script.google.com/macros/s/AKfycbzswkZb7WBo5zJIi2dwATjz5kNvw6Qx2QlNJzLj2xa8-hQTQ50iMeWZvvx7u55Zq3P5/exec";

document.addEventListener("DOMContentLoaded", () => {
  const filtroData = document.getElementById("filtro-data-resumo");
  const hojeISO = new Date().toISOString().split("T")[0];
  filtroData.value = hojeISO;

  filtroData.addEventListener("change", gerarResumo);
  document.getElementById("filtro-nome-resumo").addEventListener("input", gerarResumo);
  gerarResumo();
});

async function gerarResumo() {
  const dataFiltro = document.getElementById("filtro-data-resumo").value;
  const partes = dataFiltro.split("-");
  const dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;

  const response = await fetch(urlAPI);
  const dados = await response.json();

  const nomeFiltro = document.getElementById("filtro-nome-resumo").value.toLowerCase();
  const contagem = {};

  dados.forEach(item => {
    const dataObj = new Date(item.Data);
    const dataItem = `${dataObj.getDate().toString().padStart(2, '0')}/${(dataObj.getMonth() + 1).toString().padStart(2, '0')}/${dataObj.getFullYear()}`;
    const nome = item.Nome?.toLowerCase() || "";

    if (dataItem === dataFormatada && nome.includes(nomeFiltro)) {
      const embarcador = item.Embarcador || "Não informado";
      contagem[embarcador] = (contagem[embarcador] || 0) + 1;
    }
  });


  const divTabela = document.getElementById("resumo-tabela");
  const linhas = Object.entries(contagem)
    .map(([emb, total]) => `<tr><td>${emb}</td><td>${total}</td></tr>`)
    .join("");
  divTabela.innerHTML = `
    <table>
      <thead><tr><th>Embarcador</th><th>Cadastros</th></tr></thead>
      <tbody>${linhas}</tbody>
    </table>
  `;

  const ctx = document.getElementById("graficoResumo").getContext("2d");
  if (window.graficoBarra) window.graficoBarra.destroy();
  window.graficoBarra = new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(contagem),
      datasets: [{
        label: "Cadastros por embarcador",
        data: Object.values(contagem),
        backgroundColor: "#007b5e"
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      }
    }
  });
}

document.getElementById("recarregar-pagina").addEventListener("click", () => {
  location.reload();
});