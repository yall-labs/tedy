// tedy
// https://instantdb.com/dash?s=main&t=home&app=170841c8-fd5f-4fc3-a3a9-7cd5f89cbbd1

import { i } from "@instantdb/core";

const graph = i.graph(
  {
    "$users": i.entity({
      "email": i.string().unique().indexed(),
    }),
    "commands": i.entity({
      "description": i.string(),
      "name": i.string(),
      "value": i.string(),
    }),
    "params": i.entity({
      "name": i.string(),
      "static": i.boolean(),
      "value": i.string(),
    }),
    "plans": i.entity({
      "type": i.string(),
      "seats": i.number().indexed(),
    }),
    "teams": i.entity({
      "name": i.string().unique().indexed(),
    }),
    "usage": i.entity({
      "amount": i.number(),
      "lastUsed": i.number(),
    }),
    "usageBucket": i.entity({
      "command": i.string(),
      "params": i.string(),
      "timestamp": i.number(),
    }),
  },
  {
    "commandsTeam": {
      "forward": {
        "on": "commands",
        "has": "one",
        "label": "team"
      },
      "reverse": {
        "on": "teams",
        "has": "many",
        "label": "commands"
      }
    },
    "commandsUsage": {
      "forward": {
        "on": "commands",
        "has": "many",
        "label": "usage"
      },
      "reverse": {
        "on": "usage",
        "has": "one",
        "label": "command"
      }
    },
    "commandsUser": {
      "forward": {
        "on": "commands",
        "has": "one",
        "label": "user"
      },
      "reverse": {
        "on": "$users",
        "has": "many",
        "label": "commands"
      }
    },
    "paramsTeam": {
      "forward": {
        "on": "params",
        "has": "one",
        "label": "team"
      },
      "reverse": {
        "on": "teams",
        "has": "many",
        "label": "params"
      }
    },
    "paramsUsage": {
      "forward": {
        "on": "params",
        "has": "many",
        "label": "usage"
      },
      "reverse": {
        "on": "usage",
        "has": "one",
        "label": "param"
      }
    },
    "paramsUser": {
      "forward": {
        "on": "params",
        "has": "one",
        "label": "user"
      },
      "reverse": {
        "on": "$users",
        "has": "many",
        "label": "params"
      }
    },
    "plansUser": {
      "forward": {
        "on": "plans",
        "has": "one",
        "label": "user"
      },
      "reverse": {
        "on": "$users",
        "has": "one",
        "label": "plan"
      }
    },
    "teamsRoleAdminTeams": {
      "forward": {
        "on": "teams",
        "has": "many",
        "label": "roleAdminTeams"
      },
      "reverse": {
        "on": "$users",
        "has": "many",
        "label": "roleAdminTeams"
      }
    },
    "teamsRoleOwnTeams": {
      "forward": {
        "on": "teams",
        "has": "one",
        "label": "roleOwnTeams"
      },
      "reverse": {
        "on": "$users",
        "has": "many",
        "label": "roleOwnTeams"
      }
    },
    "teamsRoleViewTeams": {
      "forward": {
        "on": "teams",
        "has": "many",
        "label": "roleViewTeams"
      },
      "reverse": {
        "on": "$users",
        "has": "many",
        "label": "roleViewTeams"
      }
    },
    "usageBucketUser": {
      "forward": {
        "on": "usageBucket",
        "has": "one",
        "label": "user"
      },
      "reverse": {
        "on": "$users",
        "has": "many",
        "label": "usageBucket"
      }
    }
  }
);

export default graph;
