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
