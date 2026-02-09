// ======================
// DOM ELEMENTS
// ======================
const form = document.getElementById("shorten-form");
const input = document.getElementById("url-input");
const linksContainer = document.getElementById("links-container");
const errorMessage = document.querySelector(".error-message");

// ======================
// BITLY CONFIG
// ======================
const BITLY_TOKEN = "f9d732dc7cd6ae2a502d94a16d92c06164f92236";

// ======================
// STATE
// ======================
let links = JSON.parse(localStorage.getItem("shortLinks")) || [];

// ======================
// INITIAL RENDER
// ======================
renderLinks();

// ======================
// EVENT LISTENERS
// ======================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const longUrl = input.value.trim();

  if (!longUrl) {
    showError("Please add a link");
    return;
  }

  clearError();

  try {
    const shortUrl = await shortenUrl(longUrl);

    links.unshift({
      original: longUrl,
      short: shortUrl
    });

    localStorage.setItem("shortLinks", JSON.stringify(links));
    renderLinks();
    input.value = "";
  } catch (err) {
    showError("Something went wrong. Please try again.");
  }
});

// Clear error while typing
input.addEventListener("input", clearError);

// ======================
// FUNCTIONS
// ======================
async function shortenUrl(longUrl) {
  const response = await fetch("https://api-ssl.bitly.com/v4/shorten", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${BITLY_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      long_url: longUrl
    })
  });

  if (!response.ok) {
    throw new Error("Bitly API error");
  }

  const data = await response.json();
  return data.link;
}

function renderLinks() {
  linksContainer.innerHTML = "";

  links.forEach(({ original, short }) => {
    const linkDiv = document.createElement("div");
    linkDiv.className = "link-item";

    linkDiv.innerHTML = `
      <p class="original">${original}</p>
      <div class="right">
        <a href="${short}" target="_blank">${short}</a>
        <button class="copy-btn">Copy</button>
      </div>
    `;

    const copyBtn = linkDiv.querySelector(".copy-btn");

    copyBtn.addEventListener("click", () => {
      // Reset all other buttons
      document.querySelectorAll(".copy-btn").forEach(btn => {
        btn.textContent = "Copy";
        btn.classList.remove("copied");
      });

      navigator.clipboard.writeText(short);
      copyBtn.textContent = "Copied!";
      copyBtn.classList.add("copied");
    });

    linksContainer.appendChild(linkDiv);
  });
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = "block";
  input.classList.add("error");
}

function clearError() {
  errorMessage.style.display = "none";
  input.classList.remove("error");
}
