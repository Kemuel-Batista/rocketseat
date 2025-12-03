package api

import (
	"context"
	"gobid/internal/jsonutils"
	"gobid/internal/services"
	"gobid/internal/usecase/product"
	"net/http"

	"github.com/google/uuid"
)

func (api *Api) handleCreateProduct(w http.ResponseWriter, r *http.Request) {
	data, problems, err := jsonutils.DecodeValidJson[product.CreateProductUseCaseRequest](r)

	if err != nil {
		jsonutils.EncodeJson(w, r, http.StatusUnprocessableEntity, problems)
		return
	}

	userId, ok := api.Sessions.Get(r.Context(), "user_id").(uuid.UUID)
	if !ok {
		jsonutils.EncodeJson(w, r, http.StatusInternalServerError, map[string]any{
			"error": "unexpected error retrieving user from session",
		})
		return
	}

	productId, err := api.ProductService.CreateProduct(
		r.Context(),
		userId,
		data.ProductName,
		data.Description,
		data.Baseprice,
		data.AuctionEnd,
	)
	if err != nil {
		jsonutils.EncodeJson(w, r, http.StatusInternalServerError, map[string]any{
			"error": "failed to create product auction try again later",
		})
		return
	}

	ctx, _ := context.WithDeadline(context.Background(), data.AuctionEnd)

	auctionRoom := services.NewAuctionRoom(ctx, productId, &api.BidsService)

	go auctionRoom.Run()

	api.AuctionLobby.Lock()
	api.AuctionLobby.Rooms[productId] = auctionRoom
	api.AuctionLobby.Unlock()

	jsonutils.EncodeJson(w, r, http.StatusCreated, map[string]any{
		"message":    "Auction has started successfully",
		"product_id": productId,
	})
}

func (api *Api) handleGetProducts(w http.ResponseWriter, r *http.Request) {
	data, err := api.ProductService.FindManyProducts(r.Context())
	if err != nil {
		jsonutils.EncodeJson(w, r, http.StatusInternalServerError, map[string]any{
			"error": "failed to retrieve products",
		})
		return
	}

	jsonutils.EncodeJson(w, r, http.StatusOK, map[string]any{
		"products": data,
	})
}
