export default {
  "attrs": {
    "allow": {
      "create": "false"
    }
  },
  "teams": {
    "bind": [
      "userIsTeamOwner",
      "auth.id in data.ref('roleOwnTeams.id')",
      "userIsTeamAdmin",
      "userIsTeamOwner || auth.id in data.ref('roleAdminTeams.id')",
      "userIsTeamViewer",
      "userIsTeamAdmin || auth.id in data.ref('roleViewTeams.id')"
    ],
    "allow": {
      "view": "userIsTeamViewer",
      "create": "false",
      "delete": "false",
      "update": "false"
    }
  },
  "usage": {
    "bind": [
      "userOwnsUsage",
      "auth.id in data.ref('user.id')",
      "userIsTeamOwner",
      "userOwnsUsage || auth.id in data.ref('team.roleOwnTeams.id')",
      "userIsTeamAdmin",
      "userIsTeamOwner || auth.id in data.ref('team.roleAdminTeams.id')",
      "userIsTeamViewer",
      "userIsTeamAdmin || auth.id in data.ref('team.roleViewTeams.id')"
    ],
    "allow": {
      "view": "userIsTeamViewer",
      "create": "false",
      "delete": "false",
      "update": "false"
    }
  },
  "$users": {
    "bind": [
      "isUser",
      "auth.id == data.id",
      "userIsOwner",
      "data.id in auth.ref('$user.roleOwnTeams.roleAdminTeams.id') || data.id in auth.ref('$user.roleOwnTeams.roleViewTeams.id')",
      "userIsAdmin",
      "userIsOwner || data.id in auth.ref('$user.roleAdminTeams.roleOwnTeams.id') || data.id in auth.ref('$user.roleAdminTeams.roleAdminTeams.id') || data.id in auth.ref('$user.roleAdminTeams.roleViewTeams.id')",
      "userIsViewer",
      "userIsAdmin || data.id in auth.ref('$user.roleViewTeams.roleOwnTeams.id') || data.id in auth.ref('$user.roleViewTeams.roleAdminTeams.id') || data.id in auth.ref('$user.roleViewTeams.roleViewTeams.id')"
    ],
    "allow": {
      "view": "isUser || userIsViewer",
      "create": "false",
      "delete": "false",
      "update": "false"
    }
  },
  "params": {
    "bind": [
      "userIsOwner",
      "auth.id in data.ref('user.id') && 'active' in auth.ref('$user.plan.type')",
      "teamOwnerHasPlan",
      "'active' in data.ref('team.roleOwnTeams.plan.type')",
      "userIsTeamOwner",
      "auth.id in data.ref('team.roleOwnTeams.id')",
      "userIsTeamAdmin",
      "userIsTeamOwner || auth.id in data.ref('team.roleAdminTeams.id')",
      "userIsTeamViewer",
      "userIsTeamAdmin || auth.id in data.ref('team.roleViewTeams.id')",
      "canView",
      "userIsTeamViewer && teamOwnerHasPlan",
      "canMutate",
      "userIsTeamAdmin && teamOwnerHasPlan"
    ],
    "allow": {
      "view": "userIsOwner || canView",
      "create": "userIsOwner || canMutate",
      "delete": "userIsOwner || canMutate",
      "update": "userIsOwner || canMutate"
    }
  },
  "commands": {
    "bind": [
      "userIsOwner",
      "auth.id in data.ref('user.id') && 'active' in auth.ref('$user.plan.type')",
      "teamOwnerHasPlan",
      "'active' in data.ref('team.roleOwnTeams.plan.type')",
      "userIsTeamOwner",
      "auth.id in data.ref('team.roleOwnTeams.id')",
      "userIsTeamAdmin",
      "userIsTeamOwner || auth.id in data.ref('team.roleAdminTeams.id')",
      "userIsTeamViewer",
      "userIsTeamAdmin || auth.id in data.ref('team.roleViewTeams.id')",
      "canView",
      "userIsTeamViewer && teamOwnerHasPlan",
      "canMutate",
      "userIsTeamAdmin && teamOwnerHasPlan"
    ],
    "allow": {
      "view": "userIsOwner || canView",
      "create": "userIsOwner || canMutate",
      "delete": "userIsOwner || canMutate",
      "update": "userIsOwner || canMutate"
    }
  },
  "plans": {
    "bind": [
      "userIsOwner",
      "auth.id in data.ref('user.id')",
      "teamOwnerHasPlan",
      "auth.id in data.ref('user.roleOwnTeams.roleAdminTeams.id') || auth.id in data.ref('user.roleOwnTeams.roleViewTeams.id')",
    ],
    "allow": {
      "view": "userIsOwner || teamOwnerHasPlan",
      "create": "false",
      "delete": "false",
      "update": "false"
    }
  },
  "usageBucket": {
    "bind": [
      "userIsOwner",
      "auth.id in data.ref('user.id')"
    ],
    "allow": {
      "view": "userIsOwner",
      "create": "userIsOwner",
      "delete": "false",
      "update": "false"
    }
  }
};
