// Cria o botão no contextMenu
chrome.contextMenus.create({
  id: "menuItem1",
  title: "Pesquisar Referência",
  contexts: ["selection"], // Exibe apenas quando há texto selecionado
});

const recebeReferencia = function (referencia) {
  console.log(referencia);
};

// // Quando clicar no botão "Pesquisar Referência" ele vai pegar a palavra selecionada.
chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "menuItem1") {
    var reference = info.selectionText;
    recebeReferencia(reference);

    // searchGoogle(reference);
  }
});

// const searchGoogle = function (referencia) {
//   const linkGoogle = `https://www.google.com/search?q=${referencia}`;
// };
