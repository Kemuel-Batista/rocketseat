package services

import (
	"context"
	"errors"
	"log/slog"
	"sync"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

type MessageKind int

const (
	// Requests
	PlaceBid MessageKind = iota

	// OK/Success
	SuccessfullyPlacedBid

	// Errors
	FailedToPlaceBid

	// Info
	NewBidPlaced
	AuctionFinished
)

type Message struct {
	Message string
	Kind    MessageKind
	UserId  uuid.UUID
	Amount  float64
}

type AuctionLobby struct {
	sync.Mutex
	Rooms map[uuid.UUID]*AuctionRoom
}

type AuctionRoom struct {
	Id         uuid.UUID
	Context    context.Context
	Broadcast  chan Message
	Register   chan *Client
	Unregister chan *Client
	Clients    map[uuid.UUID]*Client

	BidsService *BidsService
}

func (r *AuctionRoom) registerClient(client *Client) {
	slog.Info("New user connected", "Client", client)
	r.Clients[client.UserId] = client
}

func (r *AuctionRoom) unregisterClient(client *Client) {
	slog.Info("User disconnected", "Client", client)
	delete(r.Clients, client.UserId)
}

func (r *AuctionRoom) broadcastMessage(m Message) {
	slog.Info("New message received", "RoomId", r.Id, "message", m.Message, "user_id", m.UserId)
	switch m.Kind {
	case PlaceBid:
		bid, err := r.BidsService.PlaceBid(r.Context, r.Id, m.UserId, m.Amount)
		if err != nil {
			if errors.Is(err, ErrBidAmountTooLow) {
				if client, ok := r.Clients[m.UserId]; ok {
					client.Send <- Message{
						Message: ErrBidAmountTooLow.Error(),
						Kind:    FailedToPlaceBid,
					}
				}
				return
			}
		}

		if client, ok := r.Clients[m.UserId]; ok {
			client.Send <- Message{
				Message: "Your bid has been placed successfully",
				Kind:    SuccessfullyPlacedBid,
			}
		}

		for id, client := range r.Clients {
			newBidMessage := Message{
				Kind:    NewBidPlaced,
				Message: "A new bid was placed", Amount: bid.Amount,
			}
			if id == m.UserId {
				continue
			}
			client.Send <- newBidMessage
		}
	}
}

func (r *AuctionRoom) Run() {
	slog.Info("Auction has begun", "AuctionId", r.Id)
	defer func() {
		close(r.Broadcast)
		close(r.Register)
		close(r.Unregister)
	}()

	for {
		select {
		case client := <-r.Register:
			r.registerClient(client)
		case client := <-r.Unregister:
			r.unregisterClient(client)
		case message := <-r.Broadcast:
			r.broadcastMessage(message)
		case <-r.Context.Done():
			slog.Info("Auction has ended", "AuctionId", r.Id)

			for _, client := range r.Clients {
				client.Send <- Message{
					Kind:    AuctionFinished,
					Message: "Auction has been finished",
				}
				return
			}
		}
	}
}

func NewAuctionRoom(ctx context.Context, id uuid.UUID, bidsService *BidsService) *AuctionRoom {
	return &AuctionRoom{
		Id:          id,
		Context:     ctx,
		Broadcast:   make(chan Message),
		Register:    make(chan *Client),
		Unregister:  make(chan *Client),
		Clients:     make(map[uuid.UUID]*Client),
		BidsService: bidsService,
	}
}

type Client struct {
	Room   *AuctionRoom
	Conn   *websocket.Conn
	Send   chan Message
	UserId uuid.UUID
}

func NewClient(room *AuctionRoom, conn *websocket.Conn, userId uuid.UUID) *Client {
	return &Client{
		Room:   room,
		Conn:   conn,
		Send:   make(chan Message, 512),
		UserId: userId,
	}
}
