
const fs = require("fs");
const path = require("path");

const files = fs.readdirSync(__dirname);

const projects = new Set();

files.forEach((file) => {
  const match = file.match(/^(work\d+)(?:-\d+)?\.(jpg|jpeg|png|webp)$/i);

  if (match) {
    projects.add(match[1]);
  }
});

projects.forEach((project) => {
  const images = files
    .filter((file) => {
      const pattern = new RegExp(
        "^" + project + "(?:-\\d+)?\\.(jpg|jpeg|png|webp)$",
        "i"
      );

      return pattern.test(file);
    })
    .sort((a, b) => {
      const getNumber = (file) => {
        const match = file.match(/-(\d+)\.[^.]+$/);
        return match ? Number(match[1]) : 1;
      };

      return getNumber(a) - getNumber(b);
    });

  const output = path.join(__dirname, project + "-images.json");

  fs.writeFileSync(
    output,
    JSON.stringify(images, null, 2),
    "utf8"
  );

  console.log(project + ": " + images.length + " images");
});
