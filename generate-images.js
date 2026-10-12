
const fs = require("fs");
const path = require("path");

const files = fs.readdirSync(__dirname);

// work01.jpg, work02.jpg 같은 표지 파일 찾기
const coverFiles = files.filter((file) =>
  /^work\d+\.(jpg|jpeg|png|webp)$/i.test(file)
);

// 작업물 번호순 정렬
coverFiles.sort((a, b) => {
  const getNumber = (file) =>
    Number(file.match(/^work(\d+)/i)[1]);

  return getNumber(a) - getNumber(b);
});

const projects = coverFiles.map((cover) => {
  const project = path.parse(cover).name;

  // 해당 프로젝트의 상세 이미지 찾기
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

  // 각 작업물의 이미지 목록 생성
  fs.writeFileSync(
    path.join(__dirname, project + "-images.json"),
    JSON.stringify(images, null, 2),
    "utf8"
  );

  return {
    id: project,
    cover: cover,
    detail: project + ".html",
    count: images.length
  };
});

// 전체 작업물 목록 생성
fs.writeFileSync(
  path.join(__dirname, "projects.json"),
  JSON.stringify(projects, null, 2),
  "utf8"
);

console.log("총 " + projects.length + "개 작업물 등록 완료");
