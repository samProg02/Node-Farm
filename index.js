const fs = require("fs");
const http = require("http");
const url = require("url");
const slugify = require("slugify");
const replaceTemplate = require("./modules/replaceTemplate");
//Blocking sychronous way
/*
const textIn = fs.readFileSync("./txt/input.txt", "utf-8");
console.log(textIn);

const textOut = `This is what we know about the avocado ${textIn}`;
fs.writeFileSync("./txt/output.txt", textOut);
console.log("text Written");
*/

//Blocking asynchronous way
// fs.readFile("./txt/start.txt", "utf-8", (err, data1) => {
//   fs.readFile(`./txt/${data1}.txt`, "utf-8", (err, data2) => {
//     console.log(data2);
//     fs.readFile(`./txt/append.txt`, "utf-8", (err, data3) => {
//       console.log(data3);

//       fs.writeFile("./txt/output.txt", `${data2}\n${data3}`, "utf-8", (err) => {
//         console.log("File written");
//       });
//     });
//   });
// });
//////////////////////////////////////////////
//Server

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");
const dataObj = JSON.parse(data);
const slugs = dataObj.map((el) => {
  return slugify(el.productName, {
    lower: true,
  });
});
for (i = 0; i <= dataObj.length - 1; i++) {
  dataObj[i].slugs = slugs[i];
}

const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  "utf-8"
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  "utf-8"
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  "utf-8"
);
const server = http.createServer((req, res) => {
  // console.log(req.url);
  const { query, pathname } = url.parse(req.url, true);
  // const pathName = req.url;

  /////Overview page
  if (pathname === "/overview" || pathname === "/") {
    res.writeHead(200, {
      "Content-type": "text/html",
    });
    const cardsHtml = dataObj
      .map((el) => replaceTemplate(tempCard, el))
      .join("");
    const output = tempOverview.replace("{%PRODUCT_CARDS%}", cardsHtml);

    res.end(output);

    /////Product page
  } else if (pathname === "/product") {
    res.writeHead(200, {
      "Content-type": "text/html",
    });
    const product = dataObj.find(({ slugs }) => slugs === query.id);

    const output = replaceTemplate(tempProduct, product);

    // console.log(query);
    res.end(output);

    //////API page
  } else if (pathname === "/api") {
    const api = data;
    res.writeHead(200, {
      "Content-type": "application/json",
    });
    res.end(api);
  } else {
    ////Not found
    res.writeHead(404, {
      "Content-type": "text/html",
    });
    res.end("<h1>Page not found</h1>");
  }
});

server.listen(8000, "127.0.0.1", () => {
  console.log("Listen on port 8000");
});
