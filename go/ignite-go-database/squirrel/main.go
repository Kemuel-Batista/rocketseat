package main

import (
	"fmt"

	"github.com/Masterminds/squirrel"
)

func main() {
	filters := Filters{
		ID:       123,
		Name:     "John",
		Email:    "foo",
		Username: "bar",
	}

	sql, args := build(filters)
	fmt.Println(sql)
	fmt.Println(args)
}

type Filters struct {
	ID       int64
	Name     string
	Email    string
	Username string
}

func build(f Filters) (string, []any) {
	builder := squirrel.StatementBuilder.PlaceholderFormat(squirrel.Dollar).Select("*").From("users") // -> $1, $2, ...
	// builder := squirrel.Select("*").From("users") // -> ?1, ?2, ...
	or := squirrel.Or{}

	if f.ID > 0 {
		or = append(or, squirrel.Eq{"id": f.ID})
	}

	if f.Name != "" {
		or = append(or, squirrel.Like{"name": "%" + f.Name + "%"})
	}

	if f.Email != "" {
		or = append(or, squirrel.Eq{"email": f.Email})
	}

	if f.Username != "" {
		or = append(or, squirrel.Eq{"username": f.Username})
	}

	sql, args, err := builder.Where(or).ToSql()

	if err != nil {
		panic(err)
	}

	return sql, args
}
