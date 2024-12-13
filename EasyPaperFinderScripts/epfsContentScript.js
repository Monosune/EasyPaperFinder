// To-do:
// Botão de fechar no popup >> https://www.w3schools.com/howto/howto_js_close_list_items.asp
// O popup vai abrir quando clicar em find paper
// Organizar as pastas

let reference = "";
let xpath = [
  '//*[@id="rso"]/div[1]/div/div/div/div[1]/div/div/span/a',
  'document.querySelector("#p-SAFDsUJgkJ")',
  '//*[@id="8KU72-L2ZHEJ"]',
  '//*[@id="IRbkyS18gEEJ"]',
  '//*[@id="JLR_szmRzSQJ"]',
];

const epfsCreateElements = function () {
  // Function Button
  var extensionButton = document.createElement("button");
  extensionButton.innerHTML = "Find paper";
  extensionButton.id = "find-button";
  extensionButton.addEventListener("click", goToLastPage);
  document.body.appendChild(extensionButton);

  // Search online button
  var searchOnlineButton = document.createElement("button");
  searchOnlineButton.innerHTML = "Search Online";
  searchOnlineButton.id = "search-online";
  searchOnlineButton.addEventListener("click", searchOnline);
  document.body.appendChild(searchOnlineButton);

  // Signature Text
  const signature = document.createElement("p");
  signature.innerHTML = "Created by Thiago 🐢";
  signature.id = "signature";
  document.body.appendChild(signature);

  //Pop Up
  const tutorialText = `
  
  Steps: <br>
  1. Select the reference. <br>
  2. Click "Find paper" or "Search Online" button. <br>
  `;

  const popup = document.createElement("div");
  popup.innerHTML = `<p class = 'your-reference'> ${tutorialText} </p>`;
  popup.id = "epfs-popup";
  document.body.appendChild(popup);
};

function breath(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const trimReference = function (ref, i, arr) {
  // Regex that filters the PDF text
  let regex = checkReference(ref)[1];
  let string = arr[i];
  const index = string.indexOf(ref);
  const newString = string.slice(index);
  const regexIndex = regex.exec(newString).index;
  const finalText = newString.slice(0, regexIndex).replace(ref, "");
  return finalText;
};

// Will check the reference and return required informations
const checkReference = function (ref) {
  let checkRef = ref.endsWith(".") ? ref.slice(0, -1) : ref;
  console.log(checkRef);
  if (checkRef.includes("[") || checkRef.includes("]")) {
    return [
      `.[${checkRef
        .replace("[", "")
        .replace("]", "")
        .replace(".", "")
        .replace(",", "")}]`,
      /([0-9]\.[[0-9])\w+/,
      `w${checkRef}x`,
    ];
  } else if (checkRef.includes("(") || checkRef.includes(")")) {
    return [
      `.[${checkRef
        .replace(".", "")
        .replace("(", ".")
        .replace(")", "")
        .replace(",", "")}]`,
      /([0-9]\.[(0-9])\w+/,
      `w${checkRef}x`,
    ];
  } else if (/w\d*x/gm.test(checkRef)) {
    return [checkRef, /\.w/gm];
  } else if (/w\d*/gm.test(checkRef)) {
    return [`${checkRef}x`, /\.w/gm];
  } else if (/\d*x/gm.test(checkRef)) {
    return [`w${checkRef}`, /\.w/gm];
    // Ainda falta resolver a questão de quando seleciona um nome
  } else {
    return [checkRef, /([0-9]\.[ÇA-Z][a-zåäöøÅÄÖØ])\w/gm];
  }
};

// Function that gets the text from all pages and turns into a array
const getAllPdfText = function () {
  const allPagesNumbers = document.querySelectorAll(
    "div > [data-page-number]"
  ).length;
  let fullTextArray = [];
  for (let i = allPagesNumbers; i > 0; i--) {
    try {
      let page = document.querySelector(
        `[data-page-number='${i}'] > .textLayer`
      ).textContent;
      fullTextArray.push(page);
    } catch {
      fullTextArray.push("Couldn't find the page");
    }
  }
  console.log(fullTextArray);
  findReference(fullTextArray);
};

// This function will take you to the last page so the HTML can load the DOM
async function goToLastPage() {
  document.querySelector(".your-reference").innerHTML =
    "Searching... Wait a few seconds.";
  const allPagesNumbers = document.querySelectorAll(
    "div > [data-page-number]"
  ).length;
  for (i = 1; i <= allPagesNumbers; i++) {
    document
      .querySelector(`div > [data-page-number="${i}"]`)
      .scrollIntoView({ behavior: "smooth" });
    await breath(300);
  }
  setTimeout(getAllPdfText, 2000);
}

// Receives the full reference, creates a link on google and passes it to the httpGetAsync function.
const googleFind = function (ref, type) {
  let link = "";
  if (type == "google") {
    link = "http://google.com/search?q=" + ref;
  } else if (type == "scholar") {
    link = "https://scholar.google.com/scholar?q=" + ref;
  }

  httpGetAsync(link, xpathEvaluator, type);
};

// Opens the google link and get the content and passes it to the callback function.
function httpGetAsync(theUrl, callback, type) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function () {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
      // Creates a HTML page
      let reponseHTML = document.createElement("html");
      reponseHTML.innerHTML = xmlHttp.responseText;
      callback(reponseHTML, type);
    }
  };
  xmlHttp.open("GET", theUrl, true); // true for asynchronous
  xmlHttp.send(null);
}

// Receives an input (text) and get the first URL using the xpath
function xpathEvaluator(responseHTML, type) {
  try {
    let refHref = "";
    if (type == "google") {
      refHref = document.evaluate(
        xpath[0],
        responseHTML,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue.href;
      document.querySelector(
        ".your-reference"
      ).innerHTML = `<p> Your reference:</p> <a target="_blank" href = ${refHref}> ${reference} > Your link </a>`;
    } else if (type == "scholar") {
      let query = responseHTML.querySelectorAll(".gs_rt > a");
      document.querySelector(".your-reference").innerHTML = "";
      for (i = 0; i < query.length; i++) {
        document.querySelector(
          ".your-reference"
        ).innerHTML += `<p> </p> <a target="_blank" href = ${
          query[i].href
        } > Your link .${i + 1} </a>`;
      }
    }

    // --------------------------- //
    // for (i = 1; i < xpath.length; i++) {
    //   refHref = document.evaluate(
    //     xpath[1],
    //     responseHTML,
    //     null,
    //     XPathResult.FIRST_ORDERED_NODE_TYPE,
    //     null
    //   ).singleNodeValue.href;

    //   }
    // --------------------------- //
  } catch {
    document.querySelector(".your-reference").innerHTML =
      "Oops... There as an error, try again.";
  }
}

// This function allows you to get the selected text
const findReference = function (textArray) {
  reference = window.getSelection().toString().trim();
  let n = 10;
  let newRef = checkReference(reference)[0];
  let searchRef = "";
  console.log(newRef);

  try {
    for (i = 0; i < textArray.length; i++) {
      if (textArray[i].includes(newRef)) {
        if (i < n) {
          n = i;
          searchRef = trimReference(newRef, i, textArray);
        }
      }
    }
  } catch {
    newRef = checkReference(reference)[2];
    for (i = 0; i < textArray.length; i++) {
      if (textArray[i].includes(newRef)) {
        if (i < n) {
          n = i;
          searchRef = trimReference(newRef, i, textArray);
        }
      }
    }
  }
  googleFind(searchRef, "google");
};

const searchOnline = function () {
  reference = window.getSelection().toString().trim();
  googleFind(reference, "scholar");
};
