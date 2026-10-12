
const fs = require("fs");
const path = require("path");

const files = fs.readdirSync(__dirname);
const extensions = "jpg|jpeg|png|webp";

// 기존 제목 정보도 유지
const infoPath = path.join(__dirname, "project-info.json");
const projectInfo = fs.existsSync(infoPath)
  ? JSON.parse(fs.readFileSync(infoPath, "utf8"))
  : {};

// 대표 이미지 찾기
// work01.jpg
// work03_가을맞이 특별전.jpg

const coverFiles = files.filter((file) =>
  /^(work|paiks|bomon|kbpay)\d+(?:_[^\\]+)?\.(jpg|jpeg|png|webp)$/i.test(file)
);


// 최신 작업물부터 정렬
coverFiles.sort((a, b) => {
  
const getNumber = (file) =>
  Number(file.match(/^(?:work|paiks|bomon|kbpay)(\d+)/i)[1]);


  return getNumber(b) - getNumber(a);
});


const projects = coverFiles.map((cover) => {
  const match = cover.match(/^(work|paiks|bomon|kbpay)(\d+)(?:_(.+))?\.(jpg|jpeg|png|webp)$/i);

  const project = match[1].toLowerCase() + match[2];
  const filenameTitle = match[3] || "";

  // 기존 정보가 있으면 우선 사용
  const info = projectInfo[project] || {};
  const title = filenameTitle || info.title || project.toUpperCase();

  // 상세 이미지 찾기
  const images = files
    .filter((file) => {
      if (file === cover) return true;

      const pattern = new RegExp(
        "^" + project + "-\\d+\\.(" + extensions + ")$",
        "i"
      );

      return pattern.test(file);
    })
    .sort((a, b) => {
      if (a === cover) return -1;
      if (b === cover) return 1;

      const getNumber = (file) => {
        const match = file.match(/-(\d+)\.[^.]+$/);
        return match ? Number(match[1]) : 1;
      };

      return getNumber(a) - getNumber(b);
    });

  // 상세 이미지 목록 자동 생성

fs.writeFileSync(
  path.join(__dirname, project + "-images.json"),
  JSON.stringify(images, null, 2),
  "utf8"
);

return {
  id: project,
  cover: cover,
  detail: project + ".html",
  count: images.length,
  title: title
};
});
  

const lgProjects = projects.filter((item) =>
  /^work\d+$/i.test(item.id)
);

const paiksProjects = projects.filter((item) =>
  /^paiks\d+$/i.test(item.id)
);

const bomonProjects = projects.filter((item) =>
  /^bomon\d+$/i.test(item.id)
);

const kbpayProjects = projects.filter((item) =>
  /^kbpay\d+$/i.test(item.id)
);

const projectLists = [
  ["projects.json", lgProjects],
  ["paiks-projects.json", paiksProjects],
  ["bomon-projects.json", bomonProjects],
  ["kbpay-projects.json", kbpayProjects]
];

projectLists.forEach(([filename, items]) => {
  fs.writeFileSync(
    path.join(__dirname, filename),
    JSON.stringify(items, null, 2),
    "utf8"
  );
});


// 제목 정보 자동 생성
// 기존 JSON은 수정하지 않고 별도 파일 생성
const generatedInfo = {};

projects.forEach((project) => {
  generatedInfo[project.id] = {
    title: project.title,
    date: ""
  };
});

fs.writeFileSync(
  path.join(__dirname, "project-info-generated.json"),
  
JSON.stringify(generatedInfo, null, 2).replace(
  /[\u007F-\uFFFF]/g,
  (character) =>
    "\\u" + character.charCodeAt(0).toString(16).padStart(4, "0")
),

  "utf8"
);

console.log("총 " + projects.length + "개 작업물 등록 완료");

// 상세 페이지 자동 생성
const templatePath = path.join(__dirname, "work01.html");

if (fs.existsSync(templatePath)) {
  const template = fs.readFileSync(templatePath, "utf8");

  projects.forEach((project) => {
    if (project.id === "work01") return;

    let html = template;

    html = html.replace(
      /work01-images\.json/g,
      project.id + "-images.json"
    );

    html = html.replace(
      /work01\.jpg/g,
      project.cover
    );

    // 제목 정보를 자동 생성된 JSON에서 읽도록 변경
    html = html.replace(
      /project-info\.json/g,
      "project-info-generated.json"
    );

    // 기존 HTML 제목과 날짜도 변경
    html = html.replace(
      "카드뉴스 / LG전자 베스트샵 더현대 서울 / Open Sale",
      project.title
    );

    html = html.replace(
      "2026. 10. 02",
      ""
    );

    fs.writeFileSync(
      path.join(__dirname, project.detail),
      html,
      "utf8"
    );

    console.log(project.detail + " 생성 완료");
  });
}
