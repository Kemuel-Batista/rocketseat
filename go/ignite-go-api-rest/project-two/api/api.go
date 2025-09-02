package api

import (
	"encoding/json"
	"ignite-go-api-rest/project-two/omdb"
	"log/slog"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func NewHandler(apiKey string) http.Handler {
	r := chi.NewMux()

	r.Use(middleware.Recoverer)
	r.Use(middleware.RequestID)
	r.Use(middleware.Logger)

	r.Get("/", handleSearchMovie(apiKey))

	return r
}

type Response struct {
	Error string `json:"error,omitempty"` // Se o erro estiver vazio, ele não vai estar presente na resposta
	Data  any    `json:"data,omitempty"`
}

func sendJSON(w http.ResponseWriter, resp Response, status int) {
	w.Header().Set("Content-Type", "application/json")
	data, err := json.Marshal(resp)
	if err != nil {
		slog.Error("Erro ao fazer marshal do JSON", "error", err)
		sendJSON(
			w,
			Response{Error: "Something went wrong"},
			http.StatusInternalServerError,
		)
	}

	w.WriteHeader(status)
	if _, err := w.Write(data); err != nil {
		slog.Error("Erro ao escrever resposta", "error", err)
		return
	}
}

func handleSearchMovie(apiKey string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		search := r.URL.Query().Get("s")

		result, err := omdb.Search(apiKey, search)

		if err != nil {
			sendJSON(w, Response{Error: "Something wrong with OMDB"}, http.StatusBadGateway)
			return
		}

		sendJSON(w, Response{Data: result}, http.StatusOK)
	}
}
