package api

import (
	"errors"
	"gobid/internal/jsonutils"
	"gobid/internal/services"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

func (api *Api) handleSubscribeUserToAuction(w http.ResponseWriter, r *http.Request) {
	rawProductId := chi.URLParam(r, "product_id")
	productId, err := uuid.Parse(rawProductId)
	if err != nil {
		jsonutils.EncodeJson(w, r, http.StatusBadRequest, map[string]any{
			"error": "invalid product id, must be a valid uuid",
		})
		return
	}

	_, err = api.ProductService.FindProductById(r.Context(), productId)
	if err != nil {
		if errors.Is(err, services.ErrProductNotFound) {
			jsonutils.EncodeJson(w, r, http.StatusNotFound, map[string]any{
				"message": "product not found",
			})
			return
		}

		jsonutils.EncodeJson(w, r, http.StatusInternalServerError, map[string]any{
			"error": "internal server error",
		})
		return
	}

	userId, ok := api.Sessions.Get(r.Context(), "user_id").(uuid.UUID)
	if !ok {
		jsonutils.EncodeJson(w, r, http.StatusInternalServerError, map[string]any{
			"error": "internal server error",
		})
		return
	}

	api.AuctionLobby.Lock()
	room, ok := api.AuctionLobby.Rooms[productId]

	if !ok {
		jsonutils.EncodeJson(w, r, http.StatusBadRequest, map[string]any{
			"message": "the auction for this product has ended",
		})
		return
	}
	api.AuctionLobby.Unlock()

	conn, err := api.WsUpgrader.Upgrade(w, r, nil)
	if err != nil {
		jsonutils.EncodeJson(w, r, http.StatusInternalServerError, map[string]any{
			"message": "could not upgrade connection to websocket protocol",
		})
		return
	}

	client := services.NewClient(room, conn, userId)

	room.Register <- client

	go client.ReadEventLoop()
	// go client.WriteEventLoop()
	for {
	}
}
