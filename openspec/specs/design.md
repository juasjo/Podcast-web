# Design (v3 BLINDADO)

## Data Model

[
  { type: "service", name: string, url: string },
  { type: "group", name: string, items: [{ name?: string, url: string }] }
]

## Parser (PSEUDOCÓDIGO)

currentGroup = null
result = []

for each line:
  line = trim(line)

  if empty:
    currentGroup = null
    continue

  if matches "[NAME]: URL":
    push service
    currentGroup = null

  else if matches "[NAME]":
    currentGroup = new group
    add to result

  else if matches "- item":
    if currentGroup == null:
      continue

    if matches "- NAME: URL":
      add named item

    else if matches "- URL":
      add unnamed item

  else:
    continue

## Validaciones

- URL debe empezar por http:// o https://
- Nombre no vacío

## UI

- Servicio → card
- Grupo → card + dropdown

## UX

- Toggle expand/collapse
- Animación suave
- Mobile-first
