import fs from "promise-fs";
import path from "path";
import { User } from "../gitlab-classes/User";
import {
  GitlabAccessEnumDesc,
  GitlabAccessEnum,
  GitlabProjectVisibility,
} from "../gitlab-api";
import { makeLink, medRisk, highRisk, makeTime } from "./HtmlUtils";
import { UserAccess } from "../gitlab-classes/UserAccess";

const templatePath = "./html-templates/user-proj.html";
const outPath = "./reports/";

export async function bakeTemplate(content: string, ext = ".html") {
  if (!fs.existsSync(outPath)) {
    await fs.mkdir(outPath);
  }

  let newContent = content;
  if (ext == ".html") {
    const buffer = await fs.readFile(templatePath, { encoding: "utf8" });
    const template = String(buffer);
    newContent = template.split("{0}").join(content);
  }

  const savePath = path.join(outPath, new Date().getTime().toString() + ext);
  await fs.writeFile(savePath, newContent, { encoding: "utf8" });
  console.log("[REPORT] Saved: " + savePath);
}

function riskUSerAccess(access: GitlabAccessEnum): string {
  let desc: string = GitlabAccessEnumDesc[access];
  if (access < GitlabAccessEnum.DEVELOPER) {
    // Why are you even there not coding?
    return medRisk(desc);
  } else if (access == GitlabAccessEnum.MAINTAINER) {
    // more than DEVELOPER but not owner? why?
    // wither un-portect master or back to developer
    return highRisk(desc);
  } else {
    return desc;
  }
}

function riskProjectAccess(access: UserAccess): string {
  if (!access.isProjMember) {
    return "Inhrit [Under " + access.discoveryGroups.length + " groups]";
  } else {
    return highRisk("Project");
  }
}

function riskProjectScope(scope: GitlabProjectVisibility): string {
  if (scope == "private") {
    return "PRIVATE";
  } else {
    return highRisk("PUBLIC");
  }
}

function timeLabel(time: Date, isProjectLevel: boolean) {
  if (time) {
    return makeTime(time.toString());
  } else {
    if (isProjectLevel) {
      return highRisk("No Expire");
    } else {
      return "No Expire";
    }
  }
}

export async function makeUser2ProjReport(allUsers: { [key: string]: User }) {
  var result: string = "";
  var jsonResult = [];

  Object.values(allUsers).forEach((user) => {
    result +=
      "[USER] " +
      makeLink("https://gitlab.com/" + user.username, user.name) +
      ` (@${user.username})` +
      "\r\n";
    let userObj = { user: user.username, nick: user.name, projects: [] };

    user.myProjectAccess.forEach((access) => {
      result +=
        "\t[PROJ] " +
        makeLink(
          access.myProject.web_url,
          access.myProject.name_with_namespace
        ) +
        " - " +
        riskProjectScope(access.myProject.visibility) +
        "\n\t\t* " +
        riskProjectAccess(access) +
        " - " +
        riskUSerAccess(access.myAccessMode) +
        " - " +
        timeLabel(access.myExpireDate, !access.isProjMember) +
        "\r\n";

      userObj.projects.push({
        fullurl: access.myProject.web_url,
        name: access.myProject.name_with_namespace,
        expire: access.myExpireDate,
        visibility: access.myProject.visibility,
        directmember: access.isProjMember,
        accessgroupcount: access.discoveryGroups.length,
      });
    });

    jsonResult.push(userObj);
  });

  await bakeTemplate(result, ".html");
  await bakeTemplate(JSON.stringify(jsonResult || {}, null, 4), ".json");
}
