package services

import (
	"context"
	"errors"
	pgstore "gobid/internal/store/pgstore/structs"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var (
	ErrBidAmountTooLow = errors.New("bid amount is too low")
)

type BidsService struct {
	pool    *pgxpool.Pool
	queries *pgstore.Queries
}

func NewBidsService(pool *pgxpool.Pool) BidsService {
	return BidsService{
		pool:    pool,
		queries: pgstore.New(pool),
	}
}

func (bs *BidsService) PlaceBid(
	ctx context.Context,
	product_id, bidder_id uuid.UUID,
	amount float64,
) (pgstore.Bid, error) {
	product, err := bs.queries.FindProductById(ctx, product_id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return pgstore.Bid{}, ErrProductNotFound
		}
	}

	highestBid, err := bs.queries.FindHighestBidByProductId(ctx, product_id)
	if err != nil {
		if !errors.Is(err, pgx.ErrNoRows) {
			return pgstore.Bid{}, err
		}
	}

	if product.Baseprice >= amount || highestBid.Amount >= amount {
		return pgstore.Bid{}, ErrBidAmountTooLow
	}

	highestBid, err = bs.queries.CreateBid(ctx, pgstore.CreateBidParams{
		ProductID: product_id,
		BidderID:  bidder_id,
		Amount:    amount,
	})

	if err != nil {
		return pgstore.Bid{}, err
	}

	return highestBid, err
}
