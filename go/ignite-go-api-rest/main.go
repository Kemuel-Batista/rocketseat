package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
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
		r.Post("/users", handlePostUsers(db))
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

		// Isso é um bug, não funciona como esperado
		// Toda vez que recebemos uma request em GO, automaticamente o pacote go cria uma go-routine para tratar
		// a request, ou seja, o código vai rodar pararelamente ou concurrentemente, isso não é um problema, pois
		// estou fazendo requests para mim mesmo, mas aplicação real, isso pode ser um problema, pois são várias
		// requests ao mesmo tempo
		// Estamos escrevendo e lendo para mesma variavel, causando uma race condition, pois o mapa é um ponteiro para um mapa
		user, ok := db[id]
		if !ok {
			// http.Error(w, "User not found", http.StatusNotFound) // Returns plain/text not a JSON
			w.WriteHeader(http.StatusNotFound)
			w.Write([]byte(`{"error": "User not found"}`)) // Returning a JSON error message
			return
		}

		data, err := json.Marshal(user)
		if err != nil {
			http.Error(w, "Something went wrong", http.StatusInternalServerError)
			return
		}

		w.Write(data)
	}
}

func handlePostUsers(db map[int64]User) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		r.Body = http.MaxBytesReader(w, r.Body, 10000) // Limiting the request body to 10MB
		data, err := io.ReadAll(r.Body)

		if err != nil {
			var maxErr *http.MaxBytesError
			if errors.As(err, &maxErr) {
				http.Error(w, "Request body too large", http.StatusRequestEntityTooLarge)
				return
			}

			fmt.Println(err)
			http.Error(w, "Something went wrong", http.StatusInternalServerError)
			return
		}

		var user User
		if err := json.Unmarshal(data, &user); err != nil {
			http.Error(w, "Invalid body", http.StatusUnprocessableEntity)
		}

		// this line is a bug, not works as expected
		db[user.ID] = user

		w.WriteHeader(http.StatusCreated)
	}
}
