# Agent Skills (proyecto)

Este directorio sigue el [estándar Agent Skills](https://agentskills.io/) y la [ubicación que documenta Cursor](https://cursor.com/docs/skills): las capacidades reutilizables del agente viven en **`skills/`**, cada una en su carpeta con un `SKILL.md`.

## Estructura

```text
.agents/
├── README.md          # Este archivo
└── skills/
    ├── README.md      # Índice y estado de las skills Veta
    └── <nombre-skill>/
        └── SKILL.md
```

## Relación con `.cursor/`

| Contenido                               | Ubicación          |
| --------------------------------------- | ------------------ |
| Skills (procedimientos, triggers)       | `.agents/skills/`  |
| Reglas Cursor (`.mdc`, siempre / globs) | `.cursor/rules/`   |
| Configuración MCP del IDE               | `.cursor/mcp.json` |

Cursor descubre skills en `.agents/skills/` y en `.cursor/skills/`; en este repo las skills de equipo están centralizadas en **`.agents/skills/`**.
