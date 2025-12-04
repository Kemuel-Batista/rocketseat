-- name: CreateProduct :one
INSERT INTO products (
  seller_id,
  product_name,
  description,
  baseprice,
  auction_end
) VALUES ($1, $2, $3, $4, $5)
RETURNING id;

-- name: FindManyProducts :many
SELECT
  id,
  seller_id,
  product_name,
  description,
  baseprice,
  auction_end,
  created_at,
  updated_at
FROM products
WHERE is_sold = FALSE;

-- name: FindProductById :one
SELECT * FROM products
WHERE id = $1;