import type { CartProduct, OmitedProductCart } from '../store/cart-store'

export const cartService = {
  findExistingProduct: (productList: CartProduct[], productId: number) =>
    productList.some(({ id }) => id === productId),
  addProductToCart: (
    productList: CartProduct[],
    newProduct: OmitedProductCart,
  ) => {
    const existentProduct = cartService.findExistingProduct(
      productList,
      newProduct.id,
    )

    if (existentProduct) {
      const products = productList.map((product) => {
        if (product.id === newProduct.id) {
          return { ...product, quantity: product.quantity + 1 }
        }
        return product
      })

      const total = cartService.calculateTotal(products)

      return { products, total }
    }

    const products = [...productList, { ...newProduct, quantity: 1 }]
    const total = cartService.calculateTotal(products)

    return {
      products,
      total,
    }
  },
  calculateTotal: (productList: CartProduct[]) => {
    return productList.reduce((acc, product) => {
      return acc + Number(product.price) * product.quantity
    }, 0)
  },
  removeProductFromList: (productList: CartProduct[], productId: number) => {
    const products = productList.filter(({ id }) => id !== productId)
    const value = cartService.calculateTotal(products)

    return {
      products,
      total: value,
    }
  },
  updateProductQuantity: ({
    productList,
    productId,
    quantity,
  }: {
    productList: CartProduct[]
    productId: number
    quantity: number
  }) => {
    if (quantity <= 0) {
      return cartService.removeProductFromList(productList, productId)
    }

    const products = productList.map((product) => {
      if (product.id === productId) {
        return { ...product, quantity }
      }

      return product
    })

    const total = cartService.calculateTotal(products)

    return { products, total }
  },
  getItemCount: (productList: CartProduct[]) =>
    productList.reduce((acc, product) => acc + product.quantity, 0),
}
