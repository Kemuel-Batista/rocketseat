package main

import (
	"context"
	"fmt"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	urlExample := "postgres://postgres:password@localhost:5432/ignite-go"
	db, err := pgxpool.New(context.Background(), urlExample)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to connect to database: %v\n", err)
		os.Exit(1)
	}

	if err := db.Ping(context.Background()); err != nil {
		panic(err)
	}

	query := `
	CREATE TABLE foo (
		id BIGSERIAL,
		bar VARCHAR(255)
	)
`
	if _, err := db.Exec(context.Background(), query); err != nil {
		panic(err)
	}

	query = `INSERT INTO foo (bar) VALUES ($1);`

	if _, err := db.Exec(context.Background(), query, "ABCDF"); err != nil {
		panic(err)
	}

	query = `SELECT * FROM foo LIMIT 1;`

	type foobar struct {
		id  int64
		bar string
	}
	var res foobar
	if err := db.QueryRow(context.Background(), query).Scan(&res.id, &res.bar); err != nil {
		panic(err)
	}

	// %#+v imprime tudo aquilo que você tem de informação sobre a variável
	fmt.Printf("%#+v\n", res)
}
