package main

import (
	"database/sql"
	"fmt"

	_ "github.com/mattn/go-sqlite3"
)

func main() {
	db, err := sql.Open("sqlite3", "./foo.db")

	if err != nil {
		panic(err)
	}

	createTableSql := `
		CREATE TABLE IF NOT EXISTS foo (
			id INTEGER NOT NULL PRIMARY KEY,
			name TEXT
		)
	`

	res, err := db.Exec(createTableSql)

	if err != nil {
		panic(err)
	}

	fmt.Println(res.RowsAffected())

	insertSql := `
		INSERT INTO foo (id, name) values (1, "pedro")
	`

	res, err = db.Exec(insertSql)

	if err != nil {
		panic(err)
	}

	fmt.Println(res.RowsAffected())

	type User struct {
		ID   int64
		Name string
	}

	querySql := `
		SELECT * FROM foo WHERE ID = ?
	`

	var u User
	/* Porque tenho que passar um ponteiro?
	* Porque a função Scan precisa modificar os valores das variáveis, precisa
	* ter acesso de escrita para a variável, e para isso, em Go, usamos ponteiros.
	* Se passássemos a variável diretamente, estaríamos passando uma cópia do valor,
	* e qualquer modificação feita dentro da função Scan não afetaria a variável original.
	 */
	if err := db.QueryRow(querySql, 1).Scan(&u.ID, &u.Name); err != nil {
		panic(err)
	}

	fmt.Println(u)

	// SQL INJECTION
	// input := "1; DROP TABLE foo; --"
	input := "1 OR 1 = 1"
	/*
	* Nunca use placeholder numa string de uma query que seja um input de usuário;
	 */
	deleteSql := fmt.Sprintf(`
		DELETE FROM foo WHERE id = %s;
	`, input)

	if _, err := db.Exec(deleteSql); err != nil {
		panic(err)
	}
}
