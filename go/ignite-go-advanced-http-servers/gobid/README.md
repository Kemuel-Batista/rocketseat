### Instalar pacotes do projeto
```
go mod tidy
```

### Rodar sqlc
```
sqlc generate -f ./internal/store/pg-store/sqlc.yml
```