import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { Product, Transaction } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProductJourney from "@/components/blockchain/ProductJourney";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function ProductTracking() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id.toString().includes(searchTerm)
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Product Tracking</h1>
          <p className="text-muted-foreground">
            Track products throughout their supply chain journey.
          </p>
        </div>

        {/* Search and Product List */}
        <Card>
          <CardHeader>
            <CardTitle>Product Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Search by product name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {filteredProducts.map(product => (
                <Button
                  key={product.id}
                  variant={selectedProduct?.id === product.id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="flex justify-between w-full">
                    <span>#{product.id} - {product.name}</span>
                    <span className="text-muted-foreground">{product.status}</span>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Product Journey Timeline */}
        {selectedProduct && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><span className="font-medium">Name:</span> {selectedProduct.name}</p>
                  <p><span className="font-medium">Description:</span> {selectedProduct.description}</p>
                  <p><span className="font-medium">Current Location:</span> {selectedProduct.currentLocation}</p>
                  <p><span className="font-medium">Status:</span> {selectedProduct.status}</p>
                </div>
              </CardContent>
            </Card>

            <ProductJourney 
              product={selectedProduct} 
              transactions={transactions} 
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
