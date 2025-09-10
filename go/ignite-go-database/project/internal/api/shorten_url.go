package api

import (
	"encoding/json"
	"net/http"
	"net/url"
)

type shortenURLRequest struct {
	URL string `json:"url"`
}

type shortenURLResponse struct {
	Code string `json:"code"`
}

func handleShortenURL(db map[string]string) http.HandlerFunc {
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

		code := genCode()
		db[code] = body.URL
		sendJSON(w, apiResponse{Data: shortenURLResponse{Code: code}}, http.StatusCreated)
	}
}
