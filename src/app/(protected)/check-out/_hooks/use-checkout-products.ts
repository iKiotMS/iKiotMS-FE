import { useState, useEffect } from 'react'
import { productApi } from '@/lib/api/product'
import type { Product } from '@/types/product'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/auth-store'

export function useCheckoutProducts(searchQuery: string) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const locationKey = useAuthStore((state) => state.locationKey)

  useEffect(() => {
    if (!searchQuery.trim()) {
      setProducts([])
      return
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await productApi.getList({ search: searchQuery, limit: 20, status: 'ACTIVE' })
        setProducts(res.data)
      } catch (error) {
        console.error('Search products failed:', error)
        toast.error('Không thể tìm kiếm sản phẩm')
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery, locationKey])

  return { products, loading }
}
