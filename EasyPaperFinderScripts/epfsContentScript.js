// To-do:
// Botão de fechar no popup >> https://www.w3schools.com/howto/howto_js_close_list_items.asp
// O popup vai abrir quando clicar em find paper
// Organizar as pastas
// Se tiver dando erro na hora de pegar o link provavelmente o google mudou o id

let reference = "";

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
  let regex = checkReference(ref)[2];
  console.log(ref);
  let string = arr[i];
  const index = string.indexOf(ref);
  const newString = string.slice(index);
  const regexIndex = regex.exec(newString).index;
  const finalText = newString.slice(0, regexIndex).replace(ref, "");
  return finalText;
};

// Will check the reference and return required informations
const checkReference = function (ref) {
  if (
    ref.includes("[") ||
    ref.includes("]") ||
    ref.includes("(") ||
    ref.includes(")")
  ) {
    let refCheck = refCleaner(ref);
    return ["n", `.[${refCheck.trim()}]`, /([0-9]\.[[0-9])\w+/, `w${ref}x`];
  } else if (/w\d*x/gm.test(ref)) {
    return ["n", refCheck.trim(), /\.w/gm];
  } else if (/w\d*/gm.test(ref)) {
    return ["n", `${refCheck.trim()}x`, /\.w/gm];
  } else if (/\d*x/gm.test(ref)) {
    return ["n", `w${refCheck.trim()}`, /\.w/gm];
    // Ainda falta resolver a questão de quando seleciona um nome
  } else {
    refCheck = nameRefCheck(ref);
    return ["s", refCheck, /\.[A-Za-z]+,/gm];
  }
};

// Removes special characters
const refCleaner = function (ref) {
  let checkRef = ref.includes("et al., ") ? ref.replace("et al., ", " ") : ref;

  checkRef = checkRef.includes("and") ? checkRef.replace("and", "") : checkRef;

  checkRef = checkRef.replace(/[^a-zA-Z0-9]/gm, " ");

  return checkRef;
};

// Receives the "Name et al., year/Name and name, year" type of reference and splits the name and year
const nameRefCheck = function (ref) {
  let refArray = [];
  let checkRef = refCleaner(ref);
  console.log(checkRef);
  refArray = checkRef.split("  ");
  return refArray;
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

// Opens the google link, get the content of the page turning it into a html, passing it to a variable "responseHTML" and then passes it to the callback function.
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

// Receives an input (text) and get the first URL using the js trail
function xpathEvaluator(responseHTML, type) {
  console.log(responseHTML);
  try {
    let refHref = "";
    if (type == "google") {
      console.log("oi");
      refHref = responseHTML.querySelector(
        "body>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>div>span>a"
      ).href;
      console.log(refHref);
      document.querySelector(
        ".your-reference"
      ).innerHTML = `<p> Your reference:</p> <a target="_blank" href = ${refHref}> ${reference} > Your link </a>`;
    } else if (type == "scholar") {
      let query = responseHTML.querySelectorAll(
        "body>div>div>div>div>div>div>div>h3>a"
      );
      document.querySelector(".your-reference").innerHTML = "";
      for (i = 0; i < query.length; i++) {
        document.querySelector(
          ".your-reference"
        ).innerHTML += `<p> </p> <a target="_blank" href = ${
          query[i].href
        } > Your link .${i + 1} </a>`;
      }
    }
  } catch {
    document.querySelector(".your-reference").innerHTML =
      "Oops... There as an error, try again.";
  }
}

// This function allows you to get the selected text
const findReference = function (textArray) {
  reference = window.getSelection().toString().trim();
  let informations = checkReference(reference);
  let n = 10;
  let newRef = informations[1];
  let searchRef = "";
  if (informations[0] == "n") {
    try {
      for (i = 0; i < textArray.length; i++) {
        if (textArray[i].includes(newRef)) {
          if (i < n) {
            n = i;
            searchRef = trimReference(newRef, i, textArray);
            console.log(searchRef);
          }
        }
      }
    } catch {
      newRef = informations[3];
      for (i = 0; i < textArray.length; i++) {
        if (textArray[i].includes(newRef)) {
          if (i < n) {
            n = i;
            searchRef = trimReference(newRef, i, textArray);
          }
        }
      }
    }
  } else {
    searchRef = searchByName(informations, textArray);
  }

  googleFind(searchRef, "google");
};

const searchOnline = function () {
  reference = window.getSelection().toString().trim();
  googleFind(reference, "scholar");
};

function searchByName(info, array) {
  let firstName = info[1][0].trim();
  let secondName = info.length >= 3 ? info[1][1].trim() : "";
  let year = info[1][info[1].length - 1];
  let page = "";
  let rIndex = 10;
  let possibleReferences = "";

  for (i = 0; i < array.length; i++) {
    if (
      array[i].includes("." + firstName) ||
      array[i].includes("References" + firstName)
    ) {
      if (i < rIndex) {
        rIndex = i;
        page = array[rIndex].split("." + firstName);
      }
    }
  }

  for (i = 0; i < page.length; i++) {
    let a = page[i];
    console.log(a);
    if (secondName != "") {
      if (a.includes(secondName) && a.includes(year)) {
        possibleReferences = a;
      }
    } else {
      if (page[i].includes(year)) {
        possibleReferences = a;
      }
    }
  }

  return possibleReferences;
}
