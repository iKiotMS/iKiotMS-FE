import { ProductsProvider } from './components/products-provider'
import { ProductsDialogs } from './components/products-dialogs'

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProductsProvider>
      {children}
      <ProductsDialogs />
    </ProductsProvider>
  )
}
