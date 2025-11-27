package api

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"net/url"
	"project/internal/store"
)

type shortenURLRequest struct {
	URL string `json:"url"`
}

type shortenURLResponse struct {
	Code string `json:"code"`
}

func handleShortenURL(store store.Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var body shortenURLRequest

		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			sendJSON(w, apiResponse{Error: "Invalid body"}, http.StatusUnprocessableEntity)
			return
		}

		if _, err := url.Parse(body.URL); err != nil {
			sendJSON(w, apiResponse{Error: "Invalid URL passed"}, http.StatusBadRequest)
			return
		}

		code, err := store.SaveShortenedURL(r.Context(), body.URL)
		if err != nil {
			slog.Error("failed to create code", "error", err)
			sendJSON(w, apiResponse{Error: "Something went wrong"}, http.StatusInternalServerError)
			return
		}

		sendJSON(w, apiResponse{Data: shortenURLResponse{Code: code}}, http.StatusCreated)
	}
}
