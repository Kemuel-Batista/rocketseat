package api

import (
	"encoding/json"
	"log/slog"
	"net/http"
)

func sendJSON(w http.ResponseWriter, resp apiResponse, status int) {
	w.Header().Set("Content-Type", "application/json")
	data, err := json.Marshal(resp)
	if err != nil {
		slog.Error("Erro ao fazer marshal do JSON", "error", err)
		sendJSON(
			w,
			apiResponse{Error: "Something went wrong"},
			http.StatusInternalServerError,
		)
	}

	w.WriteHeader(status)
	if _, err := w.Write(data); err != nil {
		slog.Error("Erro ao escrever resposta", "error", err)
		return
	}
}
