import { getTeamsRequest, createTeamRequest, deleteTeamRequest, updateTeamRequest } from "./requests";
import { $, debounce, sleep } from "./utils";

let allTeams = [];
var editId;

function getTeamAsHTML({ id, url, promotion, members, name }) {
  let displayURL = url;
  if (url.startsWith("https://")) {
    displayURL = url.substring(8);
  }

  return `
        <tr>
          <td>${promotion}</td>
          <td>${members}</td>
          <td>${name}</td>
          <td><a href="${url}" target="_blank">${displayURL}</a></td>
          <td>
            <a data-id="${id}" class="link-btn remove-btn">✖</a>
            <a data-id="${id}" class="link-btn edit-btn">&#9998;</a>
          </td>
        </tr>`;
}

let previewDisplayedTeams = [];
function showTeams(teams) {
  if (teams === previewDisplayedTeams) {
    console.info("same teams");
    return false;
  }
  if (teams.length === previewDisplayedTeams.length) {
    var eqContent = teams.every((team, i) => team === previewDisplayedTeams[i]);
    if (eqContent) {
      console.warn("same content");
      return false;
    }
  }
  previewDisplayedTeams = teams;
  const html = teams.map(getTeamAsHTML);
  $("table tbody").innerHTML = html.join("");
  return true;
}

async function formSubmit(e) {
  e.preventDefault();
  //console.warn("submit", e);
  const team = getFormValues();

  if (editId) {
    team.id = editId;
    console.warn("update...?", editId, team);
    const { success } = await updateTeamRequest(team);
    if (success) {
      allTeams = allTeams.map((t) => {
        if (t.id === team.id) {
          return {
            ...t, // old props
            ...team
          }; // double spread, intersectie cu prioritate obiect 2
        }
        return t;
      });
    }
  } else {
    const { success, id } = await createTeamRequest(team);
    if (success) {
      team.id = id;
      allTeams = [...allTeams, team];
    }
  }

  showTeams(allTeams) && $("#editForm").reset();
}

function getFormValues() {
  const promotion = $("#promotion").value;
  const members = $("#members").value;
  const name = $("#name").value;
  const url = $("#url").value;

  const team = {
    promotion,
    members,
    name,
    url
  };
  return team;
}

function setFormValues({ promotion, members, name, url }) {
  $("#promotion").value = promotion;
  $("#members").value = members;
  $("#name").value = name;
  $("#url").value = url;
}

async function deleteTeam(id) {
  const { success } = await deleteTeamRequest(id);
  if (success) {
    //window.location.reload();
    //loadTeams();
    allTeams = allTeams.filter((t) => t.id !== id);
    showTeams(allTeams);
  }
}

function startEditTeam(edit) {
  editId = edit;
  const team = allTeams.find(({ id }) => id === edit);

  setFormValues(team);
}

function searchTeams(teams, search) {
  search = search.toLowerCase();
  return teams.filter((team) => {
    return (
      team.members.toLowerCase().includes(search) ||
      team.promotion.toLowerCase().includes(search) ||
      team.name.toLowerCase().includes(search) ||
      team.url.toLowerCase().includes(search)
    );
  });
}

function initEvents() {
  const form = $("#editForm");
  form.addEventListener("submit", formSubmit);
  form.addEventListener("reset", () => {
    editId = undefined;
  });

  $("#search").addEventListener(
    "input",
    debounce(function (e) {
      const search = e.target.value; // = $("#search").value
      console.info("search", search);
      const teams = searchTeams(allTeams, search);
      showTeams(teams);
    }, 300)
  );

  $("table tbody").addEventListener("click", (e) => {
    if (e.target.matches("a.remove-btn")) {
      const id = e.target.dataset.id;
      deleteTeam(id);
    } else if (e.target.matches("a.edit-btn")) {
      const id = e.target.dataset.id;
      startEditTeam(id);
    }
  });
}

async function loadTeams(cb) {
  const teams = await getTeamsRequest();
  allTeams = teams;
  showTeams(teams);
  if (typeof cb === "function") {
    cb(teams);
  }
  return teams;
}

(async () => {
  $("#editForm").classList.add("loading-mask");
  await loadTeams();
  $("#editForm").classList.remove("loading-mask");

  // console.info("start");
  // // sleep(6000).then(() => {
  // //   console.info("ready to do %o", "next job");
  // // });
  // await sleep(6000);
  // console.info("ready to do %o", "next job");

  // console.warn("after sleep");

  // await sleep(5000);
  // console.info("await sleep");
})();

initEvents();
