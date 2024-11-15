# Next Traefik Config Generator

## Development Process

1. input docker-compose.yaml in textarea
2. parse yaml content in right code block
3. config area chan
4. configure a series of configuration items in the middle area, and then change them to the code block on the right

## UI Design


## Tools

- yaml
- @monaco-editor/react

## Configuration Items Example

```yaml
labels:
    - "traefik.enable=true"
    - "traefik.http.routers.sub-store.rule=Host(`xx.xx.xx`)"
    - "traefik.http.services.sub-store.loadbalancer.server.port=3001"
    - "traefik.http.routers.sub-store.entrypoints=websecure"
    - "traefik.http.routers.sub-store.tls.certresolver=myresolver"
```
