package store

import "github.com/redis/go-redis/v9"

type store struct {
	rdb *redis.Client
}

type Store interface {
}

func NewStore(rdb *redis.Client) Store {
	return store{rdb: rdb}
}
