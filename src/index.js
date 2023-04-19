let allTeams = [];
var editId;
function getTeamsRequest() {
  return fetch("http://localhost:3000/teams-json", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  }).then((r) => {
    return r.json();
  });
}

function createTeamRequest(team) {
  return fetch("http://localhost:3000/teams-json/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(team)
  }).then((r) => r.json());
}

function deleteTeamRequest(id, callback) {
  return fetch("http://localhost:3000/teams-json/delete", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ id }) // nume cheie = nume var valoare
  })
    .then((r) => r.json())
    .then((status) => {
      console.warn("before remove ", status);
      if (typeof callback === "function") {
        callback(status);
      }
      return status;
    });
}

function updateTeamRequest(team) {
  return fetch("http://localhost:3000/teams-json/update", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(team)
  }).then((r) => r.json());
}

function getTeamAsHTML(team) {
  return `
        <tr>
          <td>${team.promotion}</td>
          <td>${team.members}</td>
          <td>${team.name}</td>
          <td>${team.url}</td>
          <td>
            <a data-id="${team.id}" class="link-btn remove-btn">✖</a>
            <a data-id="${team.id}" class="link-btn edit-btn">&#9998;</a>
          </td>
        </tr>`;
}

function showTeams(teams) {
  const html = teams.map(getTeamAsHTML);
  $("table tbody").innerHTML = html.join("");
}

function $(selector) {
  return document.querySelector(selector);
}

function formSubmit(e) {
  e.preventDefault();
  //console.warn("submit", e);
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

  if (editId) {
    team.id = editId;
    console.warn("update...?", editId, team);
    updateTeamRequest(team).then((status) => {
      if (status.success) {
        window.location.reload();
      }
    });
  } else {
    createTeamRequest(team).then((status) => {
      if (status.success) {
        window.location.reload();
      }
    });
  }
}

function deleteTeam(id) {
  deleteTeamRequest(id, (status) => {
    console.warn("callback succes");
  }).then((status) => {
    if (status.success) {
      window.location.reload();
    }
  });
}

function startEditTeam(id) {
  editId = id;
  const team = allTeams.find((team) => team.id === id);

  $("#promotion").value = team.promotion;
  $("#members").value = team.members;
  $("#name").value = team.name;
  $("#url").value = team.url;
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

  $("#search").addEventListener("input", (e) => {
    const search = e.target.value; // = $("#search").value
    console.info("search", search);
    const teams = searchTeams(allTeams, search);
    showTeams(teams);
  });

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

getTeamsRequest().then((teams) => {
  allTeams = teams;
  showTeams(teams);
});

initEvents();
