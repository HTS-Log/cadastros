const urlAPI = "https://script.google.com/macros/s/AKfycbzswkZb7WBo5zJIi2dwATjz5kNvw6Qx2QlNJzLj2xa8-hQTQ50iMeWZvvx7u55Zq3P5/exec";

function carregarDados() {
  fetch(urlAPI)
    .then(response => response.json())
    .then(dados => {
      const tabela = document.getElementById("tabela-dados");
      tabela.innerHTML = "";

      const hoje = new Date();
      const dataFormatadaHoje = `${hoje.getDate().toString().padStart(2, '0')}/${(hoje.getMonth() + 1).toString().padStart(2, '0')}/${hoje.getFullYear()}`;

      dados.forEach(item => {

        const dataObjeto = new Date(item.Data);
        const dataFormatada = `${dataObjeto.getDate().toString().padStart(2, '0')}/${(dataObjeto.getMonth() + 1).toString().padStart(2, '0')}/${dataObjeto.getFullYear()} ${dataObjeto.getHours().toString().padStart(2, '0')}:${dataObjeto.getMinutes().toString().padStart(2, '0')}`;


        if (dataFormatada.startsWith(dataFormatadaHoje)) {
          const linhaHTML = `
                                <tr>
                                    <td>${dataFormatada}</td>
                                    <td>${item.Nome}</td>
                                    <td>${item.Placa}</td>
                                    <td>${item.Contato}</td>
                                    <td>${item.Status}</td>
                                    <td>${item.Finalizado || 'Não'}</td>
                                    <td>${item.Agente || 'Não informado'}</td>
                                </tr>`;
          tabela.innerHTML += linhaHTML;
        }
      });
    })
    .catch(error => console.error("Erro ao carregar os dados:", error));
}

setInterval(carregarDados, 10000);
carregarDados();