package main

import (
	"context"
	"fmt"
	"os"

	"github.com/jackc/pgx/v5/pgtype"
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

	queries := New(db)
	ctx := context.Background()

	authors, err := queries.ListAuthors(ctx)
	if err != nil {
		panic(err)
	}
	fmt.Println(authors)

	author, err := queries.CreateAuthor(ctx, CreateAuthorParams{
		Name: "Kemuel",
		Bio:  pgtype.Text{String: "Professor na rocketseat", Valid: true},
	})
	if err != nil {
		panic(err)
	}
	fmt.Println(author)
}
