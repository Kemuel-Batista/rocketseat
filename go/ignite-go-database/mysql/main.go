package main

import (
	"database/sql"
	"fmt"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

func main() {
	db, err := sql.Open("mysql", "root:password@/ignite-go")
	if err != nil {
		panic(err)
	}

	db.SetConnMaxLifetime(time.Minute * 3)
	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(10)

	if err := db.Ping(); err != nil {
		panic(err)
	}

	query := `
		CREATE TABLE foo (
			id BIGINT PRIMARY KEY AUTO_INCREMENT,
			bar VARCHAR(255)
		)
	`
	if _, err := db.Exec(query); err != nil {
		panic(err)
	}

	query = `INSERT INTO foo (bar) VALUES (?)`

	if _, err := db.Exec(query, "ABCDF"); err != nil {
		panic(err)
	}

	query = `SELECT * FROM foo LIMIT 1;`

	type foobar struct {
		id  int64
		bar string
	}
	var res foobar
	if err := db.QueryRow(query).Scan(&res.id, &res.bar); err != nil {
		panic(err)
	}

	// %#+v imprime tudo aquilo que você tem de informação sobre a variável
	fmt.Printf("%#+v\n", res)
}
