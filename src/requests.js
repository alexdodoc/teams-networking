export function getTeamsRequest() {
  return fetch("http://localhost:3000/teams-json", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  }).then((r) => {
    return r.json();
  });
}

export function createTeamRequest(team) {
  return fetch("http://localhost:3000/teams-json/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(team)
  }).then((r) => r.json());
}

export function deleteTeamRequest(id, callback) {
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

export function updateTeamRequest(team) {
  return fetch("http://localhost:3000/teams-json/update", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(team)
  }).then((r) => r.json());
}
