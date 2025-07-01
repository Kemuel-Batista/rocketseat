package main

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

type User struct {
	Username string
	ID       int64 `json:"id,string"` // Id em GO é um int64, mas no JSON será uma string
	Role     string
	Password string `json:"-"` // Ignorando o campo Password no JSON
}

func main() {
	r := chi.NewMux()

	r.Use(middleware.Recoverer)
	r.Use(middleware.RequestID)
	r.Use(middleware.Logger)

	db := map[int64]User{
		1: {
			Username: "admin",
			Password: "admin",
			Role:     "admin",
			ID:       1,
		},
	}

	r.Group(func(r chi.Router) {
		r.Use(jsonMiddleware)

		r.Get("/users/{id:[0-9]+}", handleGetUsers(db))
		r.Post("/users", handlePostUsers)
	})

	if err := http.ListenAndServe(":8080", r); err != nil {
		panic(err)
	}
}

func jsonMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		next.ServeHTTP(w, r)
	})
}

// High-order function
func handleGetUsers(db map[int64]User) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		idStr := chi.URLParam(r, "id")
		// (_) estou ignorando o erro, pois já fiz o regex que sempre vai retornar inteiro no get /users/{id}
		// Quando for ignorar um erro, tenha certeza absoluta que aquilo não pode dar um erro
		// Pois o usuário pode passar um valor enorme e dar erro de overflow do 64bit
		id, _ := strconv.ParseInt(idStr, 10, 64)

		user, ok := db[id]
		if ok {
			data, err := json.Marshal(user)

			if err != nil {
				panic(err)
			}

			w.Write(data)
		}
	}
}

func handlePostUsers(w http.ResponseWriter, r *http.Request) {}
