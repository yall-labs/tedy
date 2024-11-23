# 🧸✨ tedy - your terminal buddy

tedy aims towards smoothening team functionality in the terminal, from easy shareable commands to collaboration

**note: using tedy cloud requires you to have a plan setup / if you are part of a team, your team owner is required to have plan**

## basics

- `tedy command add` to make a command
- `tedy param add` to make a param

tedy uses sqlite dbs stored in `~/.tedy` for local references of your commands and params

## run commands

`tedy run {name}` or `tedy command run {name}` will start running your command

if there are any non-static params present in the command, they will have to be filled in first

if there are only non-static params (or no params at all), your command will start to run immediately

## use params

**note: avoid using spaces when declaring params in commands, unless spaces are needed in defaulted values**

- runtime params `{{name}}`
  - not part of a namespace
  - cannot store a value
  - can be defaulted with a value `{{name:=tedy}}`, anything after `:=` will be interpreted as part of the value until the closing brackets
  - can be defaulted with a param `{{name=local.firstname}}`
- variable params `{{local.name}}`
  - currently only available locally
  - if their value is changed during a run, this will become the newly stored value
- static params `{{local.name}} {{tedy.name}}`
  - available locally `{{local.name}}` and as a cloud param `{{tedy.name}}`
  - can only change values through `tedy param edit`

## individual vs team functionality

by default tedy uses commands and params of your individual account

we suggest setting up an alias in your bash configuration, the following example asigns a couple aliases for quick and easy usage:
```bash
# ~/.zshrc
# tedy
alias t="tedy -t"
alias tr="tedy -t run"
# tedy end
```

## using without logging in

if you're evaluating tedy or the cloud features do not appear of interest for you - no need to log in - just start making commands and params!
