const urlAPI = "https://script.google.com/macros/s/AKfycbzswkZb7WBo5zJIi2dwATjz5kNvw6Qx2QlNJzLj2xa8-hQTQ50iMeWZvvx7u55Zq3P5/exec";

document.addEventListener("DOMContentLoaded", () => {
  const filtroNome = document.getElementById("filtro-nome");
  const filtroData = document.getElementById("filtro-data");
  const tabela = document.getElementById("tabela-dados");
  const recarregarBtn = document.getElementById("recarregar-pagina");
  const toggle = document.getElementById("toggle-theme");

  // Define data atual no input de data
  const hojeISO = new Date().toISOString().split("T")[0];
  filtroData.value = hojeISO;

  // Carrega dados iniciais
  carregarDados();

  // Filtros e eventos
  filtroNome.addEventListener("input", carregarDados);
  filtroData.addEventListener("change", carregarDados);
  recarregarBtn.addEventListener("click", carregarDados);

  // Alternar modo escuro/claro
  toggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const escuro = document.body.classList.contains("dark-mode");
    toggle.textContent = escuro ? "☀️ Modo Claro" : "🌙 Modo Escuro";
  });
});

async function carregarDados() {
  const tabela = document.getElementById("tabela-dados");
  const filtroNome = document.getElementById("filtro-nome").value.toLowerCase();
  const filtroDataInput = document.getElementById("filtro-data").value;

  tabela.innerHTML = `<tr><td colspan="9">🔄 Carregando...</td></tr>`;

  try {
    const response = await fetch(urlAPI);
    if (!response.ok) throw new Error("Falha ao buscar dados");
    const dados = await response.json();

    // Converte filtro de data para DD/MM/YYYY
    const partes = filtroDataInput.split("-");
    const dataFiltro = `${partes[2]}/${partes[1]}/${partes[0]}`;

    const linhas = dados
      .filter(item => {
        const dataItem = formatarData(item.Data);
        const nomeMatch = item.Nome?.toLowerCase().includes(filtroNome);
        return dataItem === dataFiltro && nomeMatch;
      })
      .map(item => {
        const dataItem = formatarData(item.Data);
        const statusClass = item.Status === "Ativo" ? "status-ativo" : "status-inativo";
        const finalizadoClass = item.Finalizado === "Sim" ? "finalizado-sim" : "finalizado-nao";
        const finalizadoText = item.Finalizado || "Não";
        const agente = item.Agente || "Não informado";
        const embarcador = item.Embarcador || "Não informado";

        return `
          <tr>
            <td>${dataItem}</td>
            <td>${item.Nome || ""}</td>
            <td>${item.Placa || ""}</td>
            <td>${item.Contato || ""}</td>
            <td class="${statusClass}">${item.Status || ""}</td>
            <td class="${finalizadoClass}">${finalizadoText}</td>
            <td>${item.Pix || ""}</td>
            <td>${agente}</td>
            <td>${embarcador}</td>
          </tr>`;
      })
      .join("");

    tabela.innerHTML = linhas || `<tr><td colspan="9">⚠️ Nenhum dado encontrado para esta data.</td></tr>`;
  } catch (error) {
    console.error("Erro ao carregar os dados:", error);
    tabela.innerHTML = `<tr><td colspan="9" style="color:red;">❌ Erro ao carregar dados da API.</td></tr>`;
  }
}

// Corrige datas no formato BR ou ISO
function formatarData(dataStr) {
  if (!dataStr) return "";
  // Caso venha como DD/MM/YYYY
  if (dataStr.includes("/")) return dataStr;
  // Caso venha como YYYY-MM-DD ou ISO
  const data = new Date(dataStr);
  if (isNaN(data)) return "";
  return `${data.getDate().toString().padStart(2, "0")}/${(data.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${data.getFullYear()}`;
}
