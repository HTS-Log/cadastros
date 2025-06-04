const urlAPI = "https://script.google.com/macros/s/AKfycbzswkZb7WBo5zJIi2dwATjz5kNvw6Qx2QlNJzLj2xa8-hQTQ50iMeWZvvx7u55Zq3P5/exec";

function carregarDados() {
  fetch(urlAPI)
    .then(response => response.json())
    .then(dados => {
      const tabela = document.getElementById("tabela-dados");
      const filtroNome = document.getElementById("filtro-nome")?.value.toLowerCase() || "";
      const filtroDataInput = document.getElementById("filtro-data")?.value;

      tabela.innerHTML = "";

      let dataFormatadaFiltro;
      if (filtroDataInput) {
        const partes = filtroDataInput.split("-"); 
        dataFormatadaFiltro = `${partes[2]}/${partes[1]}/${partes[0]}`;
      } else {
        const hoje = new Date();
        dataFormatadaFiltro = `${hoje.getDate().toString().padStart(2, '0')}/${(hoje.getMonth() + 1).toString().padStart(2, '0')}/${hoje.getFullYear()}`;
      }

      dados.forEach(item => {
        const dataObjeto = new Date(item.Data);
        const dataFormatada = `${dataObjeto.getDate().toString().padStart(2, '0')}/${(dataObjeto.getMonth() + 1).toString().padStart(2, '0')}/${dataObjeto.getFullYear()}`;

        const nomeMatch = item.Nome?.toLowerCase().includes(filtroNome);

        if (dataFormatada === dataFormatadaFiltro && nomeMatch) {
          const statusClass = item.Status === "Ativo" ? "status-ativo" : "status-inativo";
          const finalizadoClass = item.Finalizado === "Sim" ? "finalizado-sim" : "finalizado-nao";
          const finalizadoText = item.Finalizado || "Não";
          const agente = item.Agente || "Não informado";
          const embarcador = item.Embarcador || "Não informado";
          const statusBadge = `<span class="badge ${item.Status === "Ativo" ? "ativo" : "inativo"}">${item.Status}</span>`;
const finalizadoBadge = `<span class="badge ${item.Finalizado === "Sim" ? "sim" : "nao"}">${item.Finalizado || "Não"}</span>`;

          const linhaHTML = `
            <tr>
              <td>${dataFormatada}</td>
              <td>${item.Nome}</td>
              <td>${item.Placa}</td>
              <td>${item.Contato}</td>
              <td class="${statusClass}">${item.Status}</td>
              <td class="${finalizadoClass}">${finalizadoText}</td>
              <td>${item.Pix}</td>
              <td>${agente}</td>
              <td>${embarcador}</td>
            </tr>`;
          tabela.innerHTML += linhaHTML;
        }
      });
    })
    .catch(error => console.error("Erro ao carregar os dados:", error));
}

document.getElementById("filtro-nome").addEventListener("input", carregarDados);
document.getElementById("filtro-data").addEventListener("change", carregarDados);

const hoje = new Date();
const hojeISO = hoje.toISOString().split("T")[0]; 
document.getElementById("filtro-data").value = hojeISO;

carregarDados();
setInterval(carregarDados, 10000);

const toggle = document.getElementById("toggle-theme");
toggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const modoEscuroAtivo = document.body.classList.contains("dark-mode");
  toggle.textContent = modoEscuroAtivo ? "☀️ Modo Claro" : "🌙 Modo Escuro";
});

document.getElementById("ver-resumo").addEventListener("click", async () => {
  try {
    const response = await fetch(urlAPI);
    const dados = await response.json();

    const filtroDataInput = document.getElementById("filtro-data")?.value;
    let dataFiltro = "";
    if (filtroDataInput) {
      const partes = filtroDataInput.split("-");
      dataFiltro = `${partes[2]}/${partes[1]}/${partes[0]}`;
    }

    const contador = {};
    dados.forEach(item => {
      const dataObjeto = new Date(item.Data);
      const dataFormatada = `${dataObjeto.getDate().toString().padStart(2, '0')}/${(dataObjeto.getMonth() + 1).toString().padStart(2, '0')}/${dataObjeto.getFullYear()}`;
      
      if (dataFormatada === dataFiltro) {
        const embarcador = item.Embarcador || "Não informado";
        contador[embarcador] = (contador[embarcador] || 0) + 1;
      }
    });

    const maisEnviou = Object.entries(contador).sort((a, b) => b[1] - a[1])[0];

    const resumoDiv = document.getElementById("resumo-dia");
    if (maisEnviou) {
      resumoDiv.textContent = `📌 Embarcador com mais cadastros hoje (${dataFiltro}): ${maisEnviou[0]} (${maisEnviou[1]} cadastros)`;
    } else {
      resumoDiv.textContent = `⚠️ Nenhum cadastro encontrado para a data selecionada (${dataFiltro}).`;
    }

  } catch (error) {
    console.error("Erro ao gerar resumo:", error);
  }
});

document.getElementById("recarregar-pagina").addEventListener("click", () => {
  location.reload();
});


