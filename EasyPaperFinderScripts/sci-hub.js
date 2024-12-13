// PARTE DO SCI-HUB
async function brain() {
  const url = document.getElementById("urlInput").value;

  try {
    // Faz a requisição diretamente usando fetch
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erro: ${response.statusText}`);

    const html = await response.text();

    // Vai colocar o conteúdo do site no html da extensão
    getPdfLink(html);
  } catch (error) {
    document.getElementById(
      "output"
    ).textContent = `Erro ao obter conteúdo: ${error.message}`;
    console.error("Erro ao buscar página:", error);
  }
}

// Vai pegar o link do PDF dentro do sci-hub
function getPdfLink(html) {
  let start = html.indexOf("<embed");
  let finish = html.indexOf("</embed>");
  let product = html.slice(start, finish);

  let finalProduct = product.substring(
    product.indexOf('src="//') + 7,
    product.lastIndexOf('"') - 11
  );

  window.open("https://" + finalProduct);
}
