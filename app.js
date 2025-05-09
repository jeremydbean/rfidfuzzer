// app.js
const commonFC = [1,150,167,184,28,30,402,42,76,77,78,79,82,23,99];
const commonCards = [10016,10017,10020,10021,10103,10133,11078,13773,17563,199,20328,251,2604,27443,292,29918,30353,30355,3193,33977,37547,3929,50646,521,56730,6046,62085,63703,64606,64858,64866,64899,76,80,89];

document.getElementById("generate").onclick = () => {
  const name = document.getElementById("playlistName").value.trim();
  if (!name) return alert("Playlist name is required");

  let fcList = parseRanges(document.getElementById("fcRanges").value);
  if (document.getElementById("commonFc").checked)
    fcList = mergeUnique(fcList, commonFC);
  if (!fcList.length) return alert("No facility codes specified");

  let cardList = parseRanges(document.getElementById("cardRanges").value);
  if (document.getElementById("commonCards").checked)
    cardList = mergeUnique(cardList, commonCards);
  if (!cardList.length) return alert("No card numbers specified");

  const q = document.getElementById("quantity").value.trim().toLowerCase();
  const generateAll = (q === "all");
  const count = generateAll ? 0 : parseInt(q, 10);
  if (!generateAll && (isNaN(count) || count < 1))
    return alert("Invalid quantity");

  let codes = [];
  if (generateAll) {
    for (let fc of fcList) {
      for (let c of cardList) {
        if (codes.length >= 2500) break;
        codes.push(formatHex(fc, c));
      }
      if (codes.length >= 2500) break;
    }
  } else {
    const always = [];
    for (let fc of commonFC.filter(x => fcList.includes(x)))
      for (let c of commonCards.filter(x => cardList.includes(x)))
        always.push(formatHex(fc, c));
    always.forEach(x => !codes.includes(x) && codes.push(x));

    while ((codes.length - always.length) < count) {
      const fc = fcList[Math.floor(Math.random() * fcList.length)];
      const c  = cardList[Math.floor(Math.random() * cardList.length)];
      const hx = formatHex(fc, c);
      if (!codes.includes(hx)) codes.push(hx);
    }
  }

  console.log("FCs:", fcList.sort((a,b)=>a-b));
  console.log("Cards:", cardList.sort((a,b)=>a-b));

  const blob = new Blob([ codes.join("\n") ], { type: "text/plain" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = name + ".txt";
  a.click();
  URL.revokeObjectURL(url);
  alert(`Downloaded “${name}.txt”\n\nFCs: ${fcList.join(", ")}\nCards: ${cardList.join(", ")}`);
};

function parseRanges(input) {
  if (!input) return [];
  return Array.from(new Set(input.split(",").flatMap(s => {
    s = s.trim();
    if (s.includes("-")) {
      const [lo,hi] = s.split("-").map(n=>parseInt(n,10));
      if (isNaN(lo)||isNaN(hi)) return [];
      return Array.from({length:Math.abs(hi-lo)+1},(_,i)=>Math.min(lo,hi)+i);
    } else {
      const n = parseInt(s,10);
      return isNaN(n)?[]:[n];
    }
  })));
}

function mergeUnique(a,b) {
  return Array.from(new Set([].concat(a,b)));
}

function formatHex(fc,card) {
  const id = (fc << 16) | card;
  return id.toString(16).toUpperCase().padStart(8,"0");
}